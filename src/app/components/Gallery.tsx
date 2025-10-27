'use client';

import Image from 'next/image';

const Gallery = () => {
  const galleryImages = [
    {
      src: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800&h=600",
      alt: "Documentary filming"
    },
    {
      src: "https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
      alt: "Cultural portrait"
    },
    {
      src: "https://images.pexels.com/photos/6147276/pexels-photo-6147276.jpeg?auto=compress&cs=tinysrgb&w=500&h=700",
      alt: "Nepal landscape"
    },
    {
      src: "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
      alt: "Traditional ceremony"
    },
    {
      src: "https://images.pexels.com/photos/5214324/pexels-photo-5214324.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
      alt: "Behind the scenes"
    },
    {
      src: "https://images.pexels.com/photos/5253572/pexels-photo-5253572.jpeg?auto=compress&cs=tinysrgb&w=700&h=500",
      alt: "Mountain vista"
    },
    {
      src: "https://images.pexels.com/photos/5253574/pexels-photo-5253574.jpeg?auto=compress&cs=tinysrgb&w=400&h=600",
      alt: "Local artisan"
    }
  ];

  return (
    <section data-scroll-section className="gallery-section" id="gallery">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 data-scroll data-scroll-speed="1">OUR VISUAL STORIES</h2>
          <p data-scroll data-scroll-speed="0.5">
            Capturing the essence of Nepal through cinematic storytelling
          </p>
        </div>
        
        <div className="gallery-grid" data-scroll data-scroll-speed="0.3">
          {galleryImages.map((image, index) => (
            <div 
              key={index} 
              className="gallery-item"
              data-scroll 
              data-scroll-speed={Math.random() * 0.5 + 0.2}
            >
              <div className="gallery-image-wrapper">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="gallery-overlay"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;