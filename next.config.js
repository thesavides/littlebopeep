/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // __dirname is always the directory containing next.config.js (the repo root),
    // regardless of whether we're running from the main repo or a git worktree.
    root: __dirname,
  },
}

module.exports = nextConfig
