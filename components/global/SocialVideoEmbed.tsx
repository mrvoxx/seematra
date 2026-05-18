'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface Props {
  url: string;
}

export default function SocialVideoEmbed({ url }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!url || !mounted) return null;

  // Instagram Reels logic
  if (url.includes('instagram.com')) {
    const embedUrl = url.endsWith('/embed') ? url : url.endsWith('/embed/') ? url : url.split('?')[0].replace(/\/$/, '') + '/embed';
    
    return (
      <div className="w-full bg-surface dark:bg-surface-dark rounded-2xl overflow-hidden shadow-xl border border-brand-border dark:border-brand-border-dark flex items-center justify-center min-h-[400px]">
        <iframe
          src={embedUrl}
          width="100%"
          height="550"
          frameBorder="0"
          scrolling="no"
          allowTransparency={true}
          allow="encrypted-media"
          className="rounded-2xl"
        />
      </div>
    );
  }

  // Fallback for Facebook, YouTube, MP4, etc. using react-player
  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden shadow-xl border border-brand-border dark:border-brand-border-dark flex items-center justify-center">
      <div className="w-full aspect-[9/16] max-h-[600px] flex items-center justify-center">
        <ReactPlayer 
          url={url} 
          width="100%" 
          height="100%" 
          controls 
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    </div>
  );
}

