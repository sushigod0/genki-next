// src/app/api/cloudinary/genki/route.ts
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
    console.log('Fetching ALL genki images using working method...');

    // Get ALL images from genki folder (not limited to 20)
    const result = await cloudinary.search
      .expression('folder:genki')
      .max_results(500) // Cloudinary max limit per request
      .execute();

    console.log(`Found ${result.resources?.length || 0} genki images`);

    // Transform to match expected format with high quality URLs and filtering
    const transformedResources = (result.resources || [])
      .filter((resource: any) => {
        // Filter out resources that might be problematic
        const hasValidPublicId = resource.public_id && resource.public_id.trim().length > 0;
        const hasValidUrl = resource.secure_url || resource.url;
        const isImage = resource.resource_type === 'image';
        
        if (!hasValidPublicId || !hasValidUrl || !isImage) {
          console.warn('Filtering out invalid resource:', {
            public_id: resource.public_id,
            has_url: !!hasValidUrl,
            resource_type: resource.resource_type
          });
          return false;
        }
        
        return true;
      })
      .map((resource: any) => ({
        asset_id: resource.asset_id || resource.public_id,
        public_id: resource.public_id,
        format: resource.format,
        version: resource.version,
        resource_type: resource.resource_type || 'image',
        type: resource.type || 'upload',
        created_at: resource.created_at,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        folder: 'genki',
        url: resource.url,
        secure_url: resource.secure_url,
        context: resource.context || {},
        // Add optimized URLs for different sizes
        optimized_urls: {
          thumbnail: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_400,h_400,c_fill,q_90,f_auto/${resource.public_id}`,
          medium: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_800,h_600,c_fill,q_90,f_auto/${resource.public_id}`,
          large: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_900,c_fill,q_95,f_auto/${resource.public_id}`,
          original: resource.secure_url || resource.url // Use original URL as fallback
        }
      }));

    return NextResponse.json({
      resources: transformedResources,
      total_count: transformedResources.length,
      method_used: 'search_folder_genki_all'
    });

  } catch (error) {
    console.error('Error fetching genki images:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Failed to fetch genki images', details: errorMessage },
      { status: 500 }
    );
  }
}