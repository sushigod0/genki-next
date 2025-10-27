// src/lib/galleryUtils.ts

export interface AspectRatioInfo {
  ratio: number;
  category: 'panoramic' | 'landscape' | 'square' | 'portrait';
  columnSpan: number;
  recommendedHeight: number;
}

/**
 * Analyze aspect ratio and return layout information
 */
export function analyzeAspectRatio(width: number, height: number): AspectRatioInfo {
  const ratio = width / height;
  
  let category: 'panoramic' | 'landscape' | 'square' | 'portrait';
  let columnSpan: number;
  let recommendedHeight: number;
  
  if (ratio > 2.5) {
    category = 'panoramic';
    columnSpan = 2; // Span 2 columns for very wide images
    recommendedHeight = 250;
  } else if (ratio > 1.3) {
    category = 'landscape';
    columnSpan = ratio > 1.8 ? 2 : 1; // Wide landscape images can span 2 columns
    recommendedHeight = 300;
  } else if (ratio >= 0.8) {
    category = 'square';
    columnSpan = 1;
    recommendedHeight = 350;
  } else {
    category = 'portrait';
    columnSpan = 1;
    recommendedHeight = 400;
  }
  
  return {
    ratio,
    category,
    columnSpan,
    recommendedHeight
  };
}

/**
 * Generate CSS grid classes based on aspect ratio
 */
export function getGridClasses(aspectRatioInfo: AspectRatioInfo): string {
  const baseClasses = 'gallery-item-masonry';
  const spanClass = aspectRatioInfo.columnSpan > 1 ? 'col-span-2' : 'col-span-1';
  const categoryClass = `aspect-${aspectRatioInfo.category}`;
  
  return `${baseClasses} ${spanClass} ${categoryClass}`;
}

/**
 * Calculate optimal image dimensions for display
 */
export function getOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 800
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = width / aspectRatio;
  
  // For very tall images, limit the height
  if (height > maxWidth * 1.5) {
    height = maxWidth * 1.5;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Generate Cloudinary URL with aspect ratio preservation
 */
export function buildAspectRatioPreservingUrl(
  cloudName: string,
  publicId: string,
  originalWidth: number,
  originalHeight: number,
  options: {
    maxWidth?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  const { maxWidth = 800, quality = 95, format = 'auto' } = options;
  
  const dimensions = getOptimalDimensions(originalWidth, originalHeight, maxWidth);
  
  const transformations = [
    `w_${dimensions.width}`,
    `h_${dimensions.height}`,
    'c_fit', // Preserve aspect ratio
    `q_${quality}`,
    `f_${format}`
  ].join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Sort images for optimal masonry layout
 */
export function sortImagesForMasonry<T extends { width: number; height: number }>(
  images: T[]
): T[] {
  return images.sort((a, b) => {
    const aRatio = analyzeAspectRatio(a.width, a.height);
    const bRatio = analyzeAspectRatio(b.width, b.height);
    
    // Sort by category: panoramic first, then landscape, square, portrait
    const categoryOrder = { panoramic: 0, landscape: 1, square: 2, portrait: 3 };
    
    if (categoryOrder[aRatio.category] !== categoryOrder[bRatio.category]) {
      return categoryOrder[aRatio.category] - categoryOrder[bRatio.category];
    }
    
    // Within same category, sort by aspect ratio (wider first)
    return bRatio.ratio - aRatio.ratio;
  });
}

/**
 * Calculate masonry layout heights for better distribution
 */
export function calculateMasonryHeights<T extends { width: number; height: number }>(
  images: T[],
  containerWidth: number,
  columns: number,
  gap: number = 20
): { [key: number]: number } {
  const columnWidth = (containerWidth - (gap * (columns - 1))) / columns;
  const heights: { [key: number]: number } = {};
  
  images.forEach((image, index) => {
    const aspectRatioInfo = analyzeAspectRatio(image.width, image.height);
    const actualColumns = Math.min(aspectRatioInfo.columnSpan, columns);
    const itemWidth = (columnWidth * actualColumns) + (gap * (actualColumns - 1));
    const itemHeight = itemWidth / aspectRatioInfo.ratio;
    
    heights[index] = itemHeight;
  });
  
  return heights;
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Check if image dimensions are valid
 */
export function isValidImageDimensions(width: number, height: number): boolean {
  return (
    typeof width === 'number' &&
    typeof height === 'number' &&
    width > 0 &&
    height > 0 &&
    width <= 50000 && // Reasonable maximum
    height <= 50000
  );
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get responsive breakpoints for different screen sizes
 */
export function getResponsiveColumns(screenWidth: number): number {
  if (screenWidth >= 1400) return 4;
  if (screenWidth >= 1024) return 3;
  if (screenWidth >= 768) return 2;
  return 1;
}