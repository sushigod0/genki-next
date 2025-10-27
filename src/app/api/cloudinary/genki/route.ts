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

    // Get ALL images from genki folder
    const result = await cloudinary.search
      .expression('folder:genki')
      .max_results(500) // Cloudinary max limit per request
      .execute();

    // Transform to include proper aspect ratio calculations
    const transformedResources = (result.resources || [])
      .filter((resource: any) => {
        // Filter out resources that might be problematic
        const hasValidPublicId = resource.public_id && resource.public_id.trim().length > 0;
        const hasValidUrl = resource.secure_url || resource.url;
        const isImage = resource.resource_type === 'image';
        const hasValidDimensions = resource.width && resource.height && resource.width > 0 && resource.height > 0;
        
        if (!hasValidPublicId || !hasValidUrl || !isImage || !hasValidDimensions) {
          return false;
        }
        
        return true;
      })
      .map((resource: any) => {
        // Calculate aspect ratio with fallback
        const aspectRatio = resource.aspect_ratio || (resource.width / resource.height);
        
        // console.log(`Processing image: ${resource.public_id}`);
        // console.log(`  Dimensions: ${resource.width}x${resource.height}`);
        // console.log(`  Aspect Ratio: ${aspectRatio}`);
        
        return {
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
          aspect_ratio: aspectRatio, // Ensure aspect ratio is always present
          folder: 'genki',
          url: resource.url,
          secure_url: resource.secure_url,
          context: resource.context || {},
          // Add optimized URLs for different sizes while preserving aspect ratio
          optimized_urls: {
            thumbnail: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_400,c_fit,q_90,f_auto/${resource.public_id}`,
            medium: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_800,c_fit,q_90,f_auto/${resource.public_id}`,
            large: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,c_fit,q_95,f_auto/${resource.public_id}`,
            original: resource.secure_url || resource.url // Use original URL as fallback
          }
        };
      });

    // Log some sample aspect ratios for debugging
    transformedResources.slice(0, 5).forEach((img: any, index: number) => {
    });

    return NextResponse.json({
      resources: transformedResources,
      total_count: transformedResources.length,
      method_used: 'search_folder_genki_with_aspect_ratios',
      aspect_ratio_stats: {
        landscape: transformedResources.filter((img: any) => img.aspect_ratio > 1.2).length,
        square: transformedResources.filter((img: any) => img.aspect_ratio >= 0.8 && img.aspect_ratio <= 1.2).length,
        portrait: transformedResources.filter((img: any) => img.aspect_ratio < 0.8).length,
        panoramic: transformedResources.filter((img: any) => img.aspect_ratio > 2).length,
      }
    });

  } catch (error) {    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch genki images', details: errorMessage },
      { status: 500 }
    );
  }
}