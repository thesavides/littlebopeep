# 🐑 Little Bo Peep

**Helping sheep get home safely**

A two-sided digital platform enabling members of the public to report sightings of potentially lost sheep, and sheep farmers to receive targeted alerts when sightings occur within their grazing areas.

## 🌟 Features

### For Walkers
- **Quick Reporting** - Report a sheep sighting in under 20 seconds
- **GPS Location** - Automatic location detection with manual adjustment
- **Photo Evidence** - Capture photos to help farmers identify their sheep
- **Tag System** - Describe the situation (alone, near road, distressed, etc.)
- **Report Tracking** - View status of your reports

### For Farmers
- **Real-time Alerts** - Instant notifications when sheep are spotted in your area
- **Customizable Alert Zones** - Define your grazing area with radius or polygon
- **Dashboard** - View, claim, and resolve reports
- **Notification Preferences** - Email, SMS, and push notification options
- **Quiet Hours** - Pause alerts during specific times

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **State Management**: Zustand, TanStack Query
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with PostGIS
- **Maps**: OpenStreetMap (Mapbox optional)
- **Auth**: Supabase Auth
- **Notifications**: Expo Push, Twilio SMS, Postmark Email
- **Payments**: Stripe Subscriptions

## 📱 Responsive Design

The app is fully responsive and optimized for:
- Mobile phones (iOS & Android wrappers)
- Tablets
- Desktop browsers

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/little-bo-peep.git
cd little-bo-peep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a Supabase project
2. Run the schema in `supabase/schema.sql`
3. Update environment variables with your Supabase credentials

## 📁 Project Structure

```
little-bo-peep/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── farmer/         # Farmer dashboard pages
│   │   └── walker/         # Walker app pages
│   ├── components/
│   │   ├── farmer/         # Farmer-specific components
│   │   ├── map/            # Map components
│   │   ├── ui/             # Reusable UI components
│   │   └── walker/         # Walker report flow components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   │   ├── geo.ts          # Geospatial utilities
│   │   ├── supabase.ts     # Supabase client
│   │   └── utils.ts        # General utilities
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema
└── public/                 # Static assets
```

## 🔑 Key Features Explained

### Geospatial Matching
Reports are matched to farmers using:
- **Geohash indexing** for efficient spatial queries
- **PostGIS** for accurate distance calculations
- **Polygon intersection** for custom alert boundaries

### Duplicate Prevention
The system prevents duplicate reports:
- Within 50m of an existing report
- Within 2 hours of the original report

### Privacy Protection
- No farmer personal information is visible to walkers
- Walker contact details are never shared
- Reports are anonymized

## 📊 Success Metrics

- Reports per active walker
- % reports claimed by farmers
- Mean time to resolution
- Farmer retention rate
- False report rate (<5% target)

---

Built with ❤️ for animal welfare and rural communities.
