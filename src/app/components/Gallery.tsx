'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { buildCloudinaryUrl } from '../../lib/cloudinary';

interface CloudinaryImage {
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
  aspect_ratio?: number;
  folder?: string;
  url: string;
  secure_url: string;
  context?: {
    alt?: string;
    caption?: string;
  };
  optimized_urls?: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
}

interface LayoutItem extends CloudinaryImage {
  calculatedHeight: number;
  calculatedWidth: number;
}

interface RowData {
  items: LayoutItem[];
  rowHeight: number;
}

interface GalleryProps {
  onContentLoad?: () => void;
}

const Gallery = ({ onContentLoad }: GalleryProps) => {
  const [galleryImages, setGalleryImages] = useState<CloudinaryImage[]>([]);
  const [galleryRows, setGalleryRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(16);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalImagesToLoad = useRef(0);

  // Calculate rows with proper height and centering
  const calculateGalleryRows = useCallback((images: CloudinaryImage[], width: number): RowData[] => {
    const TARGET_ROW_HEIGHT = 380;
    const GAP = 28;
    const MIN_IMAGES_PER_ROW = 2;
    const MAX_IMAGES_PER_ROW = 3;
    
    const rows: RowData[] = [];
    let currentRow: CloudinaryImage[] = [];
    let currentRowWidth = 0;
    
    images.forEach((image, index) => {
      const aspectRatio = image.aspect_ratio || (image.width / image.height);
      const imageWidth = TARGET_ROW_HEIGHT * aspectRatio;
      
      const wouldExceedWidth = currentRowWidth + imageWidth + (GAP * currentRow.length) > width;
      const hasMinImages = currentRow.length >= MIN_IMAGES_PER_ROW;
      const hasMaxImages = currentRow.length >= MAX_IMAGES_PER_ROW;
      
      if ((wouldExceedWidth && hasMinImages) || hasMaxImages) {
        // Process current row
        if (currentRow.length > 0) {
          const totalAspectRatio = currentRow.reduce((sum, img) => {
            const ratio = img.aspect_ratio || (img.width / img.height);
            return sum + ratio;
          }, 0);
          
          const rowHeight = Math.min(
            (width - (GAP * (currentRow.length - 1))) / totalAspectRatio,
            TARGET_ROW_HEIGHT * 1.3
          );
          
          const rowItems: LayoutItem[] = currentRow.map((img) => {
            const imgAspectRatio = img.aspect_ratio || (img.width / img.height);
            const imgWidth = rowHeight * imgAspectRatio;
            
            return {
              ...img,
              calculatedHeight: Math.round(Math.max(rowHeight, 200)),
              calculatedWidth: Math.round(imgWidth)
            };
          });
          
          rows.push({
            items: rowItems,
            rowHeight: Math.round(Math.max(rowHeight, 200))
          });
        }
        
        currentRow = [image];
        currentRowWidth = imageWidth;
      } else {
        currentRow.push(image);
        currentRowWidth += imageWidth;
      }
      
      // Handle last row
      if (index === images.length - 1 && currentRow.length > 0) {
        const totalAspectRatio = currentRow.reduce((sum, img) => {
          const ratio = img.aspect_ratio || (img.width / img.height);
          return sum + ratio;
        }, 0);
        
        const rowHeight = Math.min(
          (width - (GAP * (currentRow.length - 1))) / totalAspectRatio,
          TARGET_ROW_HEIGHT
        );
        
        const rowItems: LayoutItem[] = currentRow.map((img) => {
          const imgAspectRatio = img.aspect_ratio || (img.width / img.height);
          const imgWidth = rowHeight * imgAspectRatio;
          
          return {
            ...img,
            calculatedHeight: Math.round(Math.max(rowHeight, 200)),
            calculatedWidth: Math.round(imgWidth)
          };
        });
        
        rows.push({
          items: rowItems,
          rowHeight: Math.round(Math.max(rowHeight, 200))
        });
      }
    });
    
    return rows;
  }, []);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        setContainerWidth(newWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recalculate layout when container width or images change
  useEffect(() => {
    if (galleryImages.length > 0 && containerWidth > 0) {
      const visibleImages = galleryImages.slice(0, displayCount);
      const newRows = calculateGalleryRows(visibleImages, containerWidth);
      setGalleryRows(newRows);
      
      // Set total images to load for tracking
      totalImagesToLoad.current = visibleImages.length;
      setImagesLoaded(0);
    }
  }, [galleryImages, containerWidth, displayCount, calculateGalleryRows]);

  // Update locomotive scroll when images are loaded
  useEffect(() => {
    if (imagesLoaded > 0 && onContentLoad) {
      // Update locomotive scroll after images load with a small delay
      const timer = setTimeout(() => {
        onContentLoad();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [imagesLoaded, onContentLoad]);

  // Handle image load completion
  const handleImageLoad = useCallback(() => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      
      // Update locomotive scroll when all images are loaded
      if (newCount === totalImagesToLoad.current && onContentLoad) {
        setTimeout(() => {
          onContentLoad();
          // console.log('All images loaded, locomotive scroll updated');
        }, 200);
      }
      
      return newCount;
    });
  }, [onContentLoad]);

  useEffect(() => {
    const fetchCloudinaryImages = async () => {
      try {
        setLoading(true);
        setError(null);


        let response = await fetch('/api/cloudinary/genki');
        
        if (!response.ok) {
          // console.warn('Genki API failed, trying resources API...');
          response = await fetch('/api/cloudinary/resources?folder=genki&max_results=500');
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.resources && data.resources.length > 0) {
          const processedImages = data.resources.map((image: any) => ({
            ...image,
            aspect_ratio: image.aspect_ratio || (image.width / image.height)
          }));

          // Shuffle for variety
          for (let i = processedImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [processedImages[i], processedImages[j]] = [processedImages[j], processedImages[i]];
          }
          
          setGalleryImages(processedImages);
        } else {
          setError('No images found');
        }
      } catch (error) {
        setError('Failed to load images from Cloudinary');
      } finally {
        setLoading(false);
        // Update locomotive scroll even if there's an error
        if (onContentLoad) {
          setTimeout(onContentLoad, 100);
        }
      }
    };

    fetchCloudinaryImages();
  }, [onContentLoad]);

  const getOptimizedImageUrl = (item: LayoutItem) => {
    const fallbackUrl = item.secure_url || item.url;
    
    if (item.optimized_urls) {
      return item.optimized_urls.large || fallbackUrl;
    }

    if (item.public_id && !item.url.includes('pexels.com')) {
      try {
        return buildCloudinaryUrl(item.public_id, {
          width: Math.round(item.calculatedWidth * 1.5),
          height: Math.round(item.calculatedHeight * 1.5),
          crop: 'fill',
          quality: 90,
          format: 'auto'
        }) || fallbackUrl;
      } catch (error) {
        return fallbackUrl;
      }
    }
    
    return fallbackUrl;
  };

  const getImageAlt = (image: CloudinaryImage, index: number) => {
    return image.context?.alt || 
           image.context?.caption || 
           `Genkii Films Gallery Image ${index + 1}`;
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => {
      const newCount = Math.min(prev + 20, galleryImages.length);
      // Reset image loaded counter when loading more
      setImagesLoaded(0);
      return newCount;
    });
  };

  if (loading) {
    return (
      <section data-scroll-section className="gallery-section" id="gallery">
        <div className="gallery-container">
          <div className="gallery-header">
            <h2 data-scroll data-scroll-speed="1">VISUAL STORIES</h2>
            <p data-scroll data-scroll-speed="0.5">
              Loading visual stories...
            </p>
          </div>
          <div className="unsplash-gallery-loading">
            <div className="loading-row">
              <div className="loading-item" style={{ width: '30%', height: '250px' }}></div>
              <div className="loading-item" style={{ width: '45%', height: '250px' }}></div>
              <div className="loading-item" style={{ width: '23%', height: '250px' }}></div>
            </div>
            <div className="loading-row">
              <div className="loading-item" style={{ width: '60%', height: '200px' }}></div>
              <div className="loading-item" style={{ width: '38%', height: '200px' }}></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || galleryImages.length === 0) {
    return (
      <section data-scroll-section className="gallery-section" id="gallery">
        <div className="gallery-container">
          <div className="gallery-header">
            <h2 data-scroll data-scroll-speed="1">VISUAL STORIES</h2>
            <p data-scroll data-scroll-speed="0.5" className="error-message">
              {error || 'No images available'}
            </p>
            <p className="error-details">
              this is unusual, contact dev asap, SUSHIIIIIII
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-scroll-section className="gallery-section" id="gallery">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 data-scroll data-scroll-speed="1">VISUAL STORIES</h2>
          <p data-scroll data-scroll-speed="0.5">
            Capturing the essence through cinematic storytelling
          </p>
        </div>
        
        {/* Unsplash-style gallery with proper row structure and centering */}
        <div 
          ref={containerRef}
          className="unsplash-gallery" 
          data-scroll 
          data-scroll-speed="0.2"
        >
          {galleryRows.map((row, rowIndex) => (
            <div 
              key={`row-${rowIndex}`}
              className="gallery-row"
              style={{ height: `${row.rowHeight}px` }}
            >
              {row.items.map((item, itemIndex) => (
                <div 
                  key={item.asset_id || `image-${rowIndex}-${itemIndex}`} 
                  className="unsplash-item"
                  style={{
                    width: `${item.calculatedWidth}px`,
                    height: `${item.calculatedHeight}px`,
                  }}
                  data-scroll 
                  data-scroll-speed={Math.random() * 0.2 + 0.1}
                >
                  <div className="unsplash-image-wrapper">
                    <Image
                      src={getOptimizedImageUrl(item)}
                      alt={getImageAlt(item, rowIndex * 10 + itemIndex)}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes={`${item.calculatedWidth}px`}
                      quality={90}
                      priority={rowIndex < 2}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      onLoad={handleImageLoad}
                      onError={() => {
                        handleImageLoad(); // Still count it as "loaded" to avoid blocking
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Simple Load More Button */}
        {displayCount < galleryImages.length && (
          <div className="gallery-load-more">
            <button 
              className="load-more-btn"
              onClick={handleLoadMore}
            >
              Load More Images
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Gallery;