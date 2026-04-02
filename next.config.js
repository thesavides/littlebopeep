const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-config-utils')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(console.error)
}

module.exports = nextConfig
