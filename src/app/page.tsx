'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    let locoScroll: any;

    const initializeLocomotiveScroll = async () => {
      try {
        // Dynamically import locomotive-scroll to avoid SSR issues
        const LocomotiveScroll = (await import('locomotive-scroll')).default;
        
        if (containerRef.current) {
          locoScroll = new LocomotiveScroll({
            el: containerRef.current,
            smooth: true,
            smoothMobile: false,
          });
          
          locoScrollRef.current = locoScroll;
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

    // Cleanup function
    return () => {
      if (locoScroll) {
        try {
          locoScroll.destroy();
        } catch (error) {
          console.warn('Error destroying Locomotive Scroll:', error);
        }
      }
    };
  }, []);

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
            <h1 data-scroll data-scroll-speed="2">GENKI</h1>
            <h1 data-scroll data-scroll-speed="2">FILMS</h1>
            <h1 data-scroll data-scroll-speed="2">---------</h1>
            <h1 data-scroll data-scroll-speed="2">NEPAL</h1>
            <h1 data-scroll data-scroll-speed="2">---------</h1>
            <h1 data-scroll data-scroll-speed="2">STORIES</h1>
          </div>
          <div className="mask mask-sec-1">
            <Image
              data-scroll
              data-scroll-speed="-2"
              src="https://images.pexels.com/photos/6147276/pexels-photo-6147276.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
              alt="Nepal landscape cinematography"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
            />
          </div>
        </section>

        <section data-scroll-section className="sec-2">
          <div className="mask">
            <Image
              data-scroll
              data-scroll-speed="1"
              src="https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
              alt="Nepal culture and traditions"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        </section>

        <Gallery />

        <section data-scroll-section className="sec-3">
          <div className="brand-intro">
            <h2>INDEPENDENT CREATIVE STUDIO</h2>
            <p>
              Based in Nepal, we focus on storytelling through film, documentaries, and visual content. 
              Highlighting culture, lifestyle, and human stories with an authentic lens.
            </p>
          </div>
          
          <div className="mission-text">
            <p>
              Combining cinematic techniques with raw, real-life narratives, we capture Nepal's diverse landscapes, 
              people, and traditions. Our work reflects a blend of local identity and global vision, 
              showcasing Nepal's unique stories to the world through compelling visual storytelling.
            </p>
          </div>

          <div className="cta-section">
            <h3>DISCOVER NEPAL'S STORIES</h3>
            <div className="cta-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" aria-label="Vimeo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 2.906-2.541C3.977 3.731 5.040 3.028 5.708 2.96c1.573-.149 2.543.924 2.906 3.223.394 2.524.669 4.092.821 4.707.456 2.068.959 3.104 1.509 3.104.426 0 1.07-.673 1.938-2.018.867-1.346 1.332-2.37 1.393-3.069.123-1.163-.336-1.742-1.376-1.742-.492 0-.999.115-1.52.338 1.008-3.3 2.935-4.896 5.775-4.788 2.106.075 3.109 1.415 3.012 4.017z"/>
                </svg>
              </a>
              
              <a href="mailto:contact@genkifilms.com" aria-label="Email">
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