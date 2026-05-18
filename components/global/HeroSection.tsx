'use client';

import dynamic from 'next/dynamic';

const HeroCanvas = dynamic(() => import('@/components/global/HeroCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-surface dark:bg-surface-dark" />,
});

export default function HeroSection() {
  return <HeroCanvas />;
}
