'use client';

import dynamic from 'next/dynamic';
import { IMapPin } from '@/types';
import ErrorBoundary from '@/components/global/ErrorBoundary';

const MapView = dynamic(() => import('@/components/global/MapView'), {
  ssr: false,
  loading: () => <div className="h-[70vh] w-full bg-surface-dark/10 animate-pulse rounded-xl" />,
});

export default function MapClient({ pins }: { pins: IMapPin[] }) {
  return (
    <ErrorBoundary label="Map" compact>
      <MapView pins={pins} height="h-[70vh]" />
    </ErrorBoundary>
  );
}
