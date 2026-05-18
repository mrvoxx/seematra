'use client';

import { useEffect, useRef } from 'react';
import { MapPin, Sun, Moon, Camera } from 'lucide-react';

interface RoadmapDay {
  day: number;
  locationName: string;
  overview: string;
  image?: string;
  coords?: { lat: number; lng: number };
}

interface Props {
  roadmap: RoadmapDay[];
  itineraryTitle?: string;
}

export default function TravelRoadmap({ roadmap, itineraryTitle }: Props) {
  const lineRef = useRef<HTMLDivElement>(null);

  // Animate the connecting line on mount using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.height = '100%';
          }
        });
      },
      { threshold: 0.1 }
    );
    if (lineRef.current) observer.observe(lineRef.current);
    return () => observer.disconnect();
  }, []);

  if (!roadmap || roadmap.length === 0) return null;

  return (
    <section className="my-16">
      {itineraryTitle && (
        <div className="text-center mb-12">
          <span className="text-xs font-outfit font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
            Trip Roadmap
          </span>
          <h2 className="text-3xl md:text-4xl font-outfit font-extrabold mt-4 text-brand-text dark:text-brand-text-dark">
            {itineraryTitle}
          </h2>
          <p className="text-brand-text/60 dark:text-brand-text-dark/60 mt-2 font-inter">
            Your day-by-day Uttarakhand journey
          </p>
        </div>
      )}

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical connecting line */}
        <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-border/30 dark:bg-brand-border-dark/30 -translate-x-1/2">
          <div
            ref={lineRef}
            className="w-full bg-gradient-to-b from-primary via-secondary to-accent transition-all duration-[2000ms] ease-out"
            style={{ height: '0%' }}
          />
        </div>

        {roadmap.map((point, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div
              key={i}
              className={`relative flex items-start gap-6 mb-12 md:mb-0 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              } md:items-center`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Day Card */}
              <div className={`flex-1 ml-14 md:ml-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                <div
                  className={`group card p-5 border border-brand-border dark:border-brand-border-dark hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${
                    isLeft ? 'md:text-right' : 'md:text-left'
                  }`}
                >
                  {point.image && (
                    <div className={`relative w-full h-40 rounded-xl overflow-hidden mb-4 ${isLeft ? '' : ''}`}>
                      <img
                        src={point.image}
                        alt={point.locationName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className={`absolute bottom-3 flex items-center gap-1.5 text-white text-xs font-bold ${isLeft ? 'right-3' : 'left-3'}`}>
                        <Camera size={12} />
                        <span>{point.locationName}</span>
                      </div>
                    </div>
                  )}

                  <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : ''}`}>
                    <Sun size={14} className="text-primary" />
                    <span className="text-xs font-outfit font-bold text-primary uppercase tracking-wider">
                      Day {point.day}
                    </span>
                  </div>

                  <h3 className="text-lg font-outfit font-bold text-brand-text dark:text-brand-text-dark mb-2">
                    {point.locationName}
                  </h3>

                  <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70 leading-relaxed">
                    {point.overview}
                  </p>

                  {point.coords && (
                    <div className={`flex items-center gap-1 mt-3 text-xs text-brand-text/40 dark:text-brand-text-dark/40 ${isLeft ? 'md:justify-end' : ''}`}>
                      <MapPin size={10} />
                      <span className="font-mono">{point.coords.lat.toFixed(4)}, {point.coords.lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center dot node */}
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-surface dark:border-surface-dark bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-white font-outfit font-black text-sm">{point.day}</span>
                  </div>
                  {/* Pulse ring */}
                  <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: `${2 + i * 0.3}s` }} />
                </div>
                {i < roadmap.length - 1 && (
                  <Moon size={10} className="text-brand-text/20 mt-3 hidden md:block" />
                )}
              </div>

              {/* Spacer for alternating layout */}
              <div className="hidden md:block flex-1" />
            </div>
          );
        })}

        {/* End marker */}
        <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 bottom-0 -mb-4 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="text-xs text-brand-text/40 mt-1 font-outfit font-bold hidden md:block">Journey Complete</span>
        </div>
      </div>
    </section>
  );
}
