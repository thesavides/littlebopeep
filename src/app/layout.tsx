import type { Metadata } from 'next'
import './globals.css'
import ReportsLoader from '@/components/ReportsLoader'

export const metadata: Metadata = {
  title: 'Little Bo Peep - Helping sheep get home',
  description: 'Connect walkers who spot lost sheep with farmers who need to find them',
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
      <body className="bg-slate-50 min-h-screen">
        <ReportsLoader />
        {children}
      </body>
    </html>
  )
}
