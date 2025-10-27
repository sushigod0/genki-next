'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { buildCloudinaryUrl, getResponsiveImageUrls } from '../../lib/cloudinary';

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

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(21); // Start with 21 images for the full Tetris pattern

  // Remove fallback images - we want only Cloudinary
  const fallbackImages: CloudinaryImage[] = [];

  useEffect(() => {
    const fetchCloudinaryImages = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching ALL images from Cloudinary...');

        // Try the simple working API first (loads all images)
        let response = await fetch('/api/cloudinary/genki');
        
        // If that fails, try the resources API
        if (!response.ok) {
          console.warn('Genki API failed, trying resources API...');
          response = await fetch('/api/cloudinary/resources?folder=genki&max_results=500');
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.resources && data.resources.length > 0) {
          console.log(`Found ${data.resources.length} Cloudinary images using method: ${data.method_used}`);
          setGalleryImages(data.resources);
          // If we have fewer than 21 images, show all available
          if (data.resources.length < 21) {
            setDisplayCount(data.resources.length);
          }
        } else {
          console.warn('No Cloudinary images found');
          setError('No images found in your Cloudinary genki folder');
        }
      } catch (error) {
        console.error('Error fetching Cloudinary images:', error);
        setError('Failed to load images from Cloudinary');
      } finally {
        setLoading(false);
      }
    };

    fetchCloudinaryImages();
  }, []);

  const getOptimizedImageUrl = (image: CloudinaryImage, index: number) => {
    // First, try to use the original secure_url as a fallback
    const fallbackUrl = image.secure_url || image.url;
    
    // Use pre-built optimized URLs if available
    if (image.optimized_urls) {
      // For tall images (spanning 2 rows), use large size
      if (index % 7 === 0 || index % 7 === 2) { // Images 1, 3, 8, 10, etc.
        return image.optimized_urls.large || fallbackUrl;
      }
      return image.optimized_urls.medium || fallbackUrl;
    }

    // Fallback to building URL manually with proper sizing
    if (image.public_id && !image.url.includes('pexels.com')) {
      try {
        // For tall spanning images, use larger dimensions
        if (index % 7 === 0 || index % 7 === 2) {
          return buildCloudinaryUrl(image.public_id, {
            width: 600,
            height: 800,
            crop: 'fill',
            quality: 95,
            format: 'auto'
          }) || fallbackUrl;
        }
        
        // For regular images
        return buildCloudinaryUrl(image.public_id, {
          width: 500,
          height: 400,
          crop: 'fill',
          quality: 95,
          format: 'auto'
        }) || fallbackUrl;
      } catch (error) {
        console.warn('Error building Cloudinary URL for:', image.public_id, error);
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
    setDisplayCount(prev => Math.min(prev + 21, galleryImages.length)); // Load 21 more at a time
  };

  if (loading) {
    return (
      <section data-scroll-section className="gallery-section" id="gallery">
        <div className="gallery-container">
          <div className="gallery-header">
            <h2 data-scroll data-scroll-speed="1">OUR VISUAL STORIES</h2>
            <p data-scroll data-scroll-speed="0.5">
              Loading our latest visual stories...
            </p>
          </div>
          <div className="gallery-grid">
            {Array.from({ length: 21 }).map((_, index) => (
              <div key={index} className="gallery-item loading">
                <div className="gallery-image-wrapper">
                  <div className="loading-placeholder"></div>
                </div>
              </div>
            ))}
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
            <h2 data-scroll data-scroll-speed="1">OUR VISUAL STORIES</h2>
            <p data-scroll data-scroll-speed="0.5" className="error-message">
              {error || 'No images available'}
            </p>
            <p className="error-details">
              Please check your Cloudinary configuration and ensure images are uploaded to the 'genki' folder.
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
        
        {/* Restore original Tetris-style grid layout */}
        <div className="gallery-grid" data-scroll data-scroll-speed="0.3">
          {galleryImages.slice(0, displayCount).map((image, index) => (
            <div 
              key={image.asset_id || `image-${index}`} 
              className="gallery-item"
              data-scroll 
              data-scroll-speed={Math.random() * 0.5 + 0.2} // Restore parallax effect
            >
              <div className="gallery-image-wrapper">
                <Image
                  src={getOptimizedImageUrl(image, index)}
                  alt={getImageAlt(image, index)}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={95} // High quality
                  priority={index < 7} // Prioritize first 7 images
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="gallery-overlay"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {displayCount < galleryImages.length && (
          <div className="gallery-load-more">
            <button 
              className="load-more-btn"
              onClick={handleLoadMore}
            >
              Load More Images ({galleryImages.length - displayCount} remaining)
            </button>
          </div>
        )}

        {/* Show all loaded message */}
        {displayCount >= galleryImages.length && galleryImages.length > 21 && (
          <div className="gallery-complete">
            <p>All {galleryImages.length} images loaded</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;