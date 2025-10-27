'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Navbar from './components/Navbar';
import Gallery from './components/Gallery';

// Type declaration for locomotive-scroll
declare global {
  interface Window {
    LocomotiveScroll: any;
  }
}

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);
  const locoScrollRef = useRef<any>(null);

  // Callback to update locomotive scroll - expose it to child components
  const updateLocoScroll = useCallback(() => {
    if (locoScrollRef.current) {
      try {
        locoScrollRef.current.update();
        console.log('Locomotive Scroll updated');
      } catch (error) {
        console.warn('Error updating Locomotive Scroll:', error);
      }
    }
  }, []);

  useEffect(() => {
    let locoScroll: any;

    const initializeLocomotiveScroll = async () => {
      try {
        // Only initialize on desktop/tablet, not on mobile
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) {
          // Dynamically import locomotive-scroll to avoid SSR issues
          const LocomotiveScroll = (await import('locomotive-scroll')).default;
          
          if (containerRef.current) {
            locoScroll = new LocomotiveScroll({
              el: containerRef.current,
              smooth: true,
              smoothMobile: false,
              multiplier: 1,
              class: 'is-revealed',
              scrollbarContainer: false,
              resetNativeScroll: true,
            });
            
            locoScrollRef.current = locoScroll;

            // Add event listeners for scroll updates
            locoScroll.on('scroll', (instance: any) => {
              // You can add scroll position tracking here if needed
            });

            console.log('Locomotive Scroll initialized');
          }
        }
      } catch (error) {
        console.warn('Locomotive Scroll failed to initialize:', error);
      }
    };

    const initializeGSAP = async () => {
      try {
        // Dynamically import GSAP
        const { gsap } = await import('gsap');
        
        const tl = gsap.timeline();
        const maskSec1 = document.querySelector('.mask-sec-1');
        
        if (maskSec1) {
          tl
            .from(maskSec1, {
              opacity: 0,
              x: '-100px',
              duration: 1.5,
              ease: 'power3.out',
            })
            .from(
              '.lines > h1',
              {
                opacity: 0,
                x: '100px',
                stagger: 0.15,
                duration: 1.2,
                ease: 'power3.inOut',
              },
              'start-=1.45'
            );
        }
      } catch (error) {
        console.warn('GSAP failed to initialize:', error);
      }
    };

    // Initialize both libraries
    initializeLocomotiveScroll();
    initializeGSAP();

    // Update locomotive scroll when window resizes
    const handleResize = () => {
      if (locoScrollRef.current) {
        setTimeout(() => {
          updateLocoScroll();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (locoScroll) {
        try {
          locoScroll.destroy();
          console.log('Locomotive Scroll destroyed');
        } catch (error) {
          console.warn('Error destroying Locomotive Scroll:', error);
        }
      }
    };
  }, [updateLocoScroll]);

  const handleBackToTop = () => {
    if (locoScrollRef.current) {
      try {
        locoScrollRef.current.scrollTo(0);
      } catch (error) {
        console.warn('Error scrolling to top:', error);
      }
    }
  };

  return (
    <>
      <Navbar />
      <main ref={containerRef} data-scroll-container>
        <section data-scroll-section className="sec-1">
          <div className="lines">
            <h1 data-scroll data-scroll-speed="2" style={{ color: "#ff6600" }}>GENKII</h1>
            <h1 data-scroll data-scroll-speed="2">FILMS</h1>
          </div>
          <div className="mask mask-sec-1">
            <Image
              data-scroll
              data-scroll-speed="-2"
              src="/img/hero.png"
              alt="Genkii Films"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>

        <section data-scroll-section className="sec-2">
          <div className="mask video-mask">
            <video
              data-scroll
              data-scroll-speed="1"
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            >
              <source src="/vids/vids.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* Pass the update function to Gallery component */}
        <Gallery onContentLoad={updateLocoScroll} />

        <section data-scroll-section className="sec-3">
          <div className="brand-intro">
            <h2>VISUAL STORYTELLER</h2>
            <p>
              Genkii Films is a visual storyteller based in Kathmandu, Nepal documenting skateboarding, streets, and the culture that connects us.
            </p>
          </div>
          
          <div className="mission-text">
            <p>
              Through our lens, we capture the raw energy of skateboarding culture, the vibrant life of Kathmandu's streets, 
              and the authentic stories that emerge from urban Nepal. Our work celebrates the community, creativity, 
              and connections that define street culture in the heart of the Himalayas.
            </p>
          </div>

          <div className="cta-section">
            <h3>FOLLOW OUR JOURNEY</h3>
            <div className="cta-socials">
              <a href="https://www.instagram.com/genkii.films" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                </svg>
              </a>
              
              <a href="https://www.youtube.com/@GenkiiFilms" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              <a href="https://www.behance.net/genkiifilms" target="_blank" rel="noopener noreferrer" aria-label="Behance">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.34.5-.807.91-1.416 1.23.85.32 1.445.78 1.78 1.37.338.59.51 1.32.51 2.19 0 .75-.14 1.41-.423 1.96-.282.55-.68 1.01-1.19 1.38-.51.37-1.12.65-1.82.84-.71.19-1.49.29-2.34.29H0V4.51h6.938v-.007zM3.495 8.598h2.344c.407 0 .743-.07 1.01-.2.267-.13.48-.31.64-.54.16-.23.24-.49.24-.78 0-.55-.17-.96-.52-1.24-.35-.28-.86-.42-1.53-.42H3.495v3.18zm0 4.946h2.53c.42 0 .77-.05 1.05-.15.28-.1.51-.24.69-.42.18-.18.31-.39.38-.63.07-.24.11-.49.11-.75 0-.56-.17-.99-.52-1.31-.35-.32-.87-.48-1.55-.48H3.495v3.75zm7.577-2.872c0-.928.1-1.747.3-2.458.2-.71.477-1.31.833-1.798.355-.49.777-.861 1.265-1.118.488-.257 1.018-.386 1.59-.386.616 0 1.177.142 1.683.425.506.284.935.673 1.287 1.168.352.495.619 1.082.8 1.761.182.68.273 1.42.273 2.22 0 .18-.007.367-.02.56-.014.194-.028.373-.043.538H14.29c.05.705.272 1.23.667 1.574.394.344.906.516 1.537.516.424 0 .804-.1 1.142-.3.338-.2.588-.44.75-.72h2.333c-.234.73-.634 1.35-1.2 1.86-.566.51-1.317.765-2.253.765-.616 0-1.177-.11-1.683-.33-.506-.22-.935-.53-1.287-.93-.352-.4-.619-.87-.8-1.41-.182-.54-.273-1.13-.273-1.77zm5.17-1.194c-.05-.61-.244-1.084-.583-1.424-.34-.34-.772-.51-1.297-.51-.259 0-.495.053-.708.16-.213.107-.396.253-.55.438-.154.185-.275.402-.363.651-.088.249-.138.511-.15.786h3.65v-.1zM24 1.906h-4.71V.5H24v1.406z"/>
                </svg>
              </a>
              
              <a href="mailto:genkiifilms023@gmail.com" aria-label="Email">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}