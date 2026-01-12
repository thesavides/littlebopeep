# Little Bo Peep - Sheep Reporting Platform

A bilingual (English, Welsh, Irish, Scottish Gaelic) platform connecting countryside walkers who spot lost sheep with farmers who need to recover them.

## 🚀 Current Version: v1.8.0

**Production**: https://little-bo-peep-327019541186.europe-west2.run.app
**Status**: 🟢 Operational

## 📋 Documentation

**For detailed setup, deployment, and development instructions**, see:
- `/Users/chrissavides/Documents/Little Bo Peep/PROJECT-HANDOFF-TO-CLAUDE-CODE-v1.8.md` - Complete project documentation
- `/Users/chrissavides/Documents/Little Bo Peep/CRITICAL-BUILD-REQUIREMENTS.md` - Quick reference guide

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS 3.8.0 (OSM-based, no token required)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Deployment**: Google Cloud Run (auto-deploy on push)
- **Secrets**: Google Cloud Secret Manager
- **i18n**: Custom translation system (260+ keys, 4 languages)

## 🎯 Key Features

- **Multi-language Support**: English, Welsh, Irish, Scottish Gaelic
- **Role-based Access**: Walker, Farmer, Admin dashboards
- **Interactive Maps**: Mapbox GL with custom OSM styling + fence/wall layers
- **Real-time Data**: Supabase realtime subscriptions
- **Secure Authentication**: Supabase Auth with localStorage
- **Geofencing**: PostGIS-based field boundary alerts for farmers
- **Translation System**: Instant language switching, no page refresh

## 🔐 Security

**All credentials are stored in Google Cloud Secret Manager.**

⚠️ Never commit:
- `.env` or `.env.local` files
- API keys or credentials
- Database passwords

## 🌍 Translation System

All user-facing text MUST use the translation context:

```typescript
import { useTranslation } from '@/contexts/TranslationContext'

const { t } = useTranslation()
return <button>{t('namespace.key', {}, 'English Fallback')}</button>
```

See `CRITICAL-BUILD-REQUIREMENTS.md` for complete translation workflow.

## 🚀 Development

### Local Setup

```bash
# Install dependencies
npm install

# Create .env.local with Supabase credentials (see documentation)
touch .env.local

# Start development server
npm run dev
# Opens at http://localhost:3001

# Build for production
npm run build
```

### Environment Variables (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oyfikxdowpekmcxszbqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Secret Manager>
```

## 🚀 Deployment

**Automatic**: Pushes to `main` branch trigger Cloud Build

**Manual** (if needed):
```bash
gcloud run deploy little-bo-peep \
  --source=. \
  --region=europe-west2 \
  --platform=managed \
  --allow-unauthenticated \
  --project=little-bo-peep-483820 \
  --clear-env-vars \
  --update-secrets=NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL:latest,NEXT_PUBLIC_SUPABASE_ANON_KEY=NEXT_PUBLIC_SUPABASE_ANON_KEY:latest
```

## 📦 Project Structure

```
src/
├── app/                           # Next.js 14 app directory
│   ├── auth/                      # Authentication pages
│   ├── layout.tsx                 # Root layout (TranslationProvider)
│   └── page.tsx                   # Entry point
├── components/                    # React components
│   ├── HomePage.tsx               # Landing page (112 translations)
│   ├── WalkerDashboard.tsx        # Walker interface (57 translations)
│   ├── FarmerDashboard.tsx        # Farmer interface (109 translations)
│   ├── AdminDashboard.tsx         # Admin interface (85 translations)
│   ├── Header.tsx                 # Navigation
│   └── LanguageSelector.tsx       # Language dropdown
├── contexts/
│   └── TranslationContext.tsx     # Global translation state
└── lib/
    ├── i18n.ts                    # Translation utilities
    └── supabase.ts                # Supabase client

supabase/                          # SQL migration files
├── seed-english-translations.sql  # Homepage translations
├── walker-translation-keys.sql    # Walker dashboard (57 keys)
├── farmer-translation-keys.sql    # Farmer dashboard (109 keys)
└── admin-translation-keys.sql     # Admin panel (85 keys)

cloudbuild.yaml                    # Cloud Build config (Secret Manager)
```

## 📊 Current Status

**Completed** ✅:
- Translation system (260+ English keys)
- All dashboards internationalized
- Google Cloud Secret Manager integration
- Auto-deployment pipeline
- Interactive maps with OSM + fence/wall layers
- User authentication and role management
- Walker reporting flow (4 steps)
- Farmer registration (5 steps)
- Admin oversight panel

**In Progress** ⏳:
- Welsh/Irish/Gaelic translations (753 pending)
- Photo upload for reports
- Email notifications for farmers
- Stripe payment integration

## 📝 Git Commit Format

All commits should include Claude Code attribution:

```bash
git commit -m "$(cat <<'EOF'
Brief description of changes

Detailed explanation if needed.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

## 🔗 Links

- **Production**: https://little-bo-peep-327019541186.europe-west2.run.app
- **GitHub**: https://github.com/thesavides/littlebopeep
- **Supabase Dashboard**: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg
- **Google Cloud Console**: https://console.cloud.google.com/home/dashboard?project=little-bo-peep-483820

## 📖 Version History

- **v1.8.0** (Jan 12, 2026) - Google Cloud Secret Manager migration ✅
- **v1.7.0** (Jan 12, 2026) - Complete dashboard translations ✅
- **v1.6.0** (Jan 12, 2026) - Translation re-rendering fix ✅
- **v1.5.0** (Jan 12, 2026) - Map layers fix ✅
- **v1.4.0** (Jan 11, 2026) - Initial translation system ✅
- **v1.2.0** - Map improvements
- **v1.1.0** - Authentication
- **v1.0.0** - Baseline

---

**Last Updated**: January 12, 2026
**Version**: v1.8.0
**Status**: 🟢 Production Ready
