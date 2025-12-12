// src/lib/cloudinary.ts
export interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder: string;
  url: string;
  secure_url: string;
}

export interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

/**
 * Fetch images from Cloudinary folder
 */
export async function getCloudinaryImages(folder: string = 'genki'): Promise<CloudinaryResource[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
  }

  try {
    // Use Cloudinary's search API to get images from the specific folder
    const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/list/${folder}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response to match our expected format
    const resources: CloudinaryResource[] = data.resources || [];
    
    return resources;
  } catch (error) {
    return [];
  }
}

/**
 * Generate optimized Cloudinary URL with high quality settings
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName || !publicId) {
    return '';
  }

  // Clean the publicId - remove any leading/trailing slashes or spaces
  const cleanPublicId = publicId.trim().replace(/^\/+|\/+$/g, '');
  
  if (!cleanPublicId) {
    return '';
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 95, // Higher quality (was 'auto')
    format = 'auto'
  } = options;

  let transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformationString = transformations.length > 0 ? `${transformations.join(',')}` : '';
  
  try {
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanPublicId}`;
    return url;
  } catch (error) {
    return '';
  }
}

/**
 * Generate responsive image URLs for different screen sizes
 */

export function getResponsiveImageUrls(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    return {
      thumbnail: '',
      small: '',
      medium: '',
      large: '',
      xlarge: '',
      original: ''
    };
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return {
    thumbnail: `${baseUrl}/w_400,h_400,c_fill,q_90,f_auto/${publicId}`,
    small: `${baseUrl}/w_600,h_600,c_fill,q_90,f_auto/${publicId}`,
    medium: `${baseUrl}/w_800,h_800,c_fill,q_95,f_auto/${publicId}`,
    large: `${baseUrl}/w_1200,h_1200,c_fill,q_95,f_auto/${publicId}`,
    xlarge: `${baseUrl}/w_1600,h_1600,c_fill,q_95,f_auto/${publicId}`,
    original: `${baseUrl}/q_100,f_auto/${publicId}`
  };
}

/**
 * Alternative method using Cloudinary Admin API (requires API credentials)
 */

export async function getCloudinaryImagesWithCredentials(): Promise<CloudinaryResource[]> {
  try {
    const response = await fetch('/api/cloudinary/images');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resources || [];
  } catch (error) {
    return [];
  }
}