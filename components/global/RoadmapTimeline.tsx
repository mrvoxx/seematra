// components/global/RoadmapTimeline.tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IRoadmapPoint } from '@/types';
import { MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  points: IRoadmapPoint[];
}

export default function RoadmapTimeline({ points }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Array<HTMLDivElement | null>>([]);
  
  useEffect(() => {
    if (!containerRef.current || !lineRef.current) return;
    
    const ctx = gsap.context(() => {
      // Animate the vertical line drawing down as user scrolls
      gsap.fromTo(
        lineRef.current,
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1, // Smooth scrub
          }
        }
      );

      // Animate each day node popping in
      nodesRef.current.forEach((node, i) => {
        if (!node) return;
        const isLeft = i % 2 === 0;
        
        gsap.fromTo(
          node,
          { 
            opacity: 0, 
            x: isLeft ? -50 : 50,
            scale: 0.9 
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, [points]);

  return (
    <div className="relative py-12" ref={containerRef}>
      {/* Center Line Background */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-brand-border dark:bg-brand-border-dark -translate-x-1/2 rounded-full" />
      
      {/* Animated Center Line Foreground */}
      <div 
        ref={lineRef}
        className="absolute left-4 md:left-1/2 top-0 w-1 bg-gradient-to-b from-primary to-accent -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(232,127,36,0.8)]"
      />

      <div className="flex flex-col gap-12 relative z-10 w-full pl-8 md:pl-0">
        {points.map((point, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div 
              key={`${point.day}-${index}`}
              className={`flex flex-col md:flex-row items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}
              ref={(el) => { if(el) nodesRef.current[index] = el; }}
            >
              {/* Spacer for alternating layout */}
              <div className="hidden md:block w-1/2" />
              
              {/* Center Dot */}
              <div className="absolute left-4 md:left-1/2 w-8 h-8 md:w-10 md:h-10 bg-primary border-4 border-surface dark:border-surface-dark rounded-full -translate-x-1/2 flex items-center justify-center shadow-lg z-20 transition-transform hover:scale-125">
                <span className="text-surface font-outfit font-bold text-xs md:text-sm">{point.day}</span>
              </div>
              
              {/* Content Card */}
              <div className={`w-full md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'} pt-2`}>
                <div className="card p-5 group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-3 text-primary font-bold font-outfit">
                    <MapPin size={18} />
                    <h4 className="text-xl">{point.locationName}</h4>
                  </div>
                  
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-4 border border-brand-border dark:border-brand-border-dark">
                    <img 
                      src={point.image} 
                      alt={point.locationName} 
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <p className="text-sm font-inter text-brand-text/80 dark:text-brand-text-dark/80 whitespace-pre-line">
                    {point.overview}
                  </p>

                  {/* Night Stay Block */}
                  {point.nightStay && (
                    <div className="mt-4 pt-4 border-t border-brand-border dark:border-brand-border-dark flex items-start gap-3 bg-surface dark:bg-surface-dark/50 p-3 rounded-lg">
                      <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                        <img src={point.nightStay.image} alt="Night stay" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-outfit font-bold text-secondary mb-1 uppercase">Night Stay Included</p>
                        <p className="text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                          {point.nightStay.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
