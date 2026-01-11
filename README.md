# Little Bo Peep

A two-sided web platform connecting countryside walkers who spot lost sheep with farmers who need to recover them.

## Current Version: v1.2.0

### Features
- Walker reporting flow (GPS-enabled)
- Farmer dashboard with field management
- Admin oversight
- localStorage authentication
- Map integration with Leaflet
- Auto-location and layer controls

## Tech Stack
- Next.js 14.2.35
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Leaflet (maps)
- Google Cloud Run (deployment)

## Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run dev server
npm run dev

# Build for production
npm run build
```

## Deployment

Auto-deploys to Cloud Run when pushing to main branch via Cloud Build triggers.

Production: https://little-bo-peep-327019541186.europe-west2.run.app
