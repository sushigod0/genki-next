// src/app/api/cloudinary/resources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'genki';
    const maxResults = parseInt(searchParams.get('max_results') || '30');

    console.log('Fetching resources from folder:', folder);

    // Based on the test results, your images are in the genki folder
    // but can only be accessed via search, not prefix
    // So let's use the search API that works
    
    try {
      console.log('Using search API (working method from test)...');
      const searchResult = await cloudinary.search
        .expression(`folder:${folder}`)
        .max_results(maxResults)
        .execute();

      console.log(`Search API found ${searchResult.resources?.length || 0} resources`);

      if (searchResult.resources && searchResult.resources.length > 0) {
        const transformedResources = searchResult.resources.map((resource: any) => ({
          asset_id: resource.asset_id,
          public_id: resource.public_id,
          format: resource.format,
          version: resource.version,
          resource_type: resource.resource_type,
          type: resource.type,
          created_at: resource.created_at,
          bytes: resource.bytes,
          width: resource.width,
          height: resource.height,
          folder: resource.folder,
          url: resource.url,
          secure_url: resource.secure_url,
          context: resource.context || {}
        }));

        return NextResponse.json({
          resources: transformedResources,
          total_count: transformedResources.length,
          method_used: 'search_api'
        });
      }
    } catch (searchError) {
      console.log('Search API failed, trying resources API with filtering...');
    }

    // Fallback: Get all resources and filter for genki folder
    console.log('Using resources API with filtering...');
    const allResources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 100, // Get enough to capture all your images
      resource_type: 'image'
    });

    // Filter for images in the genki folder
    const genkiResources = allResources.resources?.filter((resource: any) => 
      resource.folder === folder
    ) || [];

    console.log(`Resources API found ${allResources.resources?.length || 0} total, ${genkiResources.length} in genki folder`);

    // Transform and limit results
    const transformedResources = genkiResources.slice(0, maxResults).map((resource: any) => ({
      asset_id: resource.asset_id,
      public_id: resource.public_id,
      format: resource.format,
      version: resource.version,
      resource_type: resource.resource_type,
      type: resource.type,
      created_at: resource.created_at,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      folder: resource.folder,
      url: resource.url,
      secure_url: resource.secure_url,
      context: resource.context || {}
    }));

    return NextResponse.json({
      resources: transformedResources,
      total_count: genkiResources.length,
      method_used: 'resources_api_filtered'
    });

  } catch (error) {
    console.error('Error fetching Cloudinary resources:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const { searchParams } = new URL(request.url);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch images from Cloudinary', 
        details: errorMessage,
        folder: searchParams.get('folder') || 'genki'
      },
      { status: 500 }
    );
  }
}