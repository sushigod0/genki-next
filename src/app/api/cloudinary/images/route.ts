// src/app/api/cloudinary/images/route.ts
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

    // Search for images in the specified folder (working method from test)
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      // Remove the problematic sort_by - it's causing the API error
      .max_results(maxResults)
      .execute();

    return NextResponse.json({
      resources: result.resources || [],
      total_count: result.total_count || 0,
    });
  } catch (error) {    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Try alternative approach using resources API
    try {      
      const { searchParams } = new URL(request.url); // Re-declare here
      const folder = searchParams.get('folder') || 'genki'; // Fix: Re-declare folder variable
      const maxResults = parseInt(searchParams.get('max_results') || '30');
      
      // Since your images are in the genki folder but prefix doesn't work,
      // let's get all images and filter them
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 100, // Get more to ensure we catch all genki images
        resource_type: 'image'
      });

      // Filter for images that have folder: "genki"
      const genkiImages = result.resources?.filter((resource: any) => 
        resource.folder === folder
      ) || [];
      return NextResponse.json({
        resources: genkiImages.slice(0, maxResults),
        total_count: genkiImages.length,
      });
    } catch (fallbackError) {
      
      const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
      
      return NextResponse.json(
        { error: 'Failed to fetch images from Cloudinary', details: errorMessage },
        { status: 500 }
      );
    }
  }
}