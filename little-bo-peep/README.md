# 🐑 Little Bo Peep

**Helping sheep get home safely**

Little Bo Peep is a two-sided digital platform connecting countryside walkers with local farmers. When walkers spot a potentially lost sheep, they can report it in seconds, and nearby farmers receive instant alerts.

## 🌟 Features

### For Walkers
- **Quick Reporting** - Report a sheep sighting in under 20 seconds
- **No Account Required** - Start helping immediately
- **GPS Location** - Automatic location detection with manual adjustment
- **Photo Evidence** - Optional photo upload for better identification
- **Safety Guidance** - Built-in safety reminders

### For Farmers
- **Real-time Alerts** - Instant notifications when sheep are spotted in your area
- **Custom Alert Zones** - Define your grazing areas with polygon or radius
- **Claim & Track** - Mark reports as yours and track recovery
- **Privacy Protected** - Your details are never shared with walkers
- **Notification Controls** - Set quiet hours and channel preferences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/little-bo-peep.git
cd little-bo-peep

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 App Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── walker/            # Walker-facing pages
│   └── farmer/            # Farmer-facing pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── walker/            # Walker-specific components
│   ├── farmer/            # Farmer-specific components
│   └── map/               # Map components
├── lib/                   # Utilities and configurations
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Maps**: OpenStreetMap
- **Icons**: Lucide React

## 📱 Mobile Wrapper Ready

This responsive web app is designed to be wrapped for iOS and Android using Capacitor or similar tools.

## 📄 License

MIT License

---

**Built with ❤️ for the countryside community**
