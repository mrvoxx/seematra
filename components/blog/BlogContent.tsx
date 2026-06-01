'use client';

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ItineraryEmbedCard from '@/components/blog/ItineraryEmbedCard';

interface Props {
  html: string;
  className?: string;
}

/**
 * Renders HTML content and replaces any
 * <div data-itinerary-embed="ID"></div> placeholders with
 * the live <ItineraryEmbedCard> React component.
 */
export default function BlogContent({ html, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find all embed placeholders
    const placeholders = containerRef.current.querySelectorAll<HTMLElement>(
      '[data-itinerary-embed]',
    );

    const roots: ReturnType<typeof createRoot>[] = [];

    placeholders.forEach(el => {
      const id = el.getAttribute('data-itinerary-embed');
      if (!id) return;

      // Replace the placeholder element with a React root
      const wrapper = document.createElement('div');
      el.replaceWith(wrapper);

      const root = createRoot(wrapper);
      root.render(<ItineraryEmbedCard itineraryId={id} />);
      roots.push(root);
    });

    // Clean up React roots on unmount
    return () => {
      roots.forEach(r => {
        try { r.unmount(); } catch {}
      });
    };
  // Re-run whenever html changes (edit mode preview etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
