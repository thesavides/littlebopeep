import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Little Bo Peep - Helping Sheep Get Home',
  description: 'Report lost sheep sightings and help farmers recover their animals. A simple app connecting walkers and farmers for better animal welfare.',
  keywords: ['sheep', 'farming', 'lost animals', 'countryside', 'walkers', 'agriculture'],
  authors: [{ name: 'Little Bo Peep' }],
  openGraph: {
    title: 'Little Bo Peep',
    description: 'Helping sheep get home safely',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐑</text></svg>" />
      </head>
      <body className="bg-stone-50 text-stone-900 antialiased">
        {children}
        <Toast />
      </body>
    </html>
  );
}
