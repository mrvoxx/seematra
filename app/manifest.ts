import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Seematra Admin Dashboard',
    short_name: 'Seematra',
    description: 'OTA Administration for Seematra Travel',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f97316', // Primary brand color
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
