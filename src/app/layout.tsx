import type { Metadata, Viewport } from 'next'
import './globals.css'
import ReportsLoader from '@/components/ReportsLoader'
import { TranslationProvider } from '@/contexts/TranslationContext'
import ServiceWorkerSetup from '@/components/ServiceWorkerSetup'
import HelpChatbot from '@/components/HelpChatbot'

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
    // Explicit apple-touch-icon sizes — iOS ignores the web manifest and
    // requires these link tags to show the real icon on the home screen.
    apple: [
      { url: '/apple-touch-icon.png',     sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-167.png', sizes: '167x167', type: 'image/png' },
      { url: '/apple-touch-icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-120.png', sizes: '120x120', type: 'image/png' },
    ],
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
          <HelpChatbot />
        </TranslationProvider>
      </body>
    </html>
  )
}
