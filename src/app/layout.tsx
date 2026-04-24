import type { Metadata, Viewport } from 'next'
import './globals.css'
import ReportsLoader from '@/components/ReportsLoader'
import { TranslationProvider } from '@/contexts/TranslationContext'
import ServiceWorkerSetup from '@/components/ServiceWorkerSetup'

export const metadata: Metadata = {
  title: 'Little Bo Peep, Real-time countryside reporting',
  description: 'Real-time countryside reporting',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Little Bo Peep',
  },
  icons: {
    icon: '/logo-pin.svg',
    apple: '/logo-pin.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#614270',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-[#D1D9C5] min-h-screen font-sans">
        <TranslationProvider>
          <ServiceWorkerSetup />
          <ReportsLoader />
          {children}
        </TranslationProvider>
      </body>
    </html>
  )
}
