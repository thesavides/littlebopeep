'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSelector from './LanguageSelector'

export default function HomePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { setRole, setAdmin, users } = useAppStore()

  const handleWalkerClick = () => {
    router.push('/auth')
  }

  const handleFarmerClick = () => {
    router.push('/auth')
  }

  const handleAdminClick = () => {
    const password = prompt(t('home.adminPasswordPrompt', {}, 'Enter admin password:'))
    if (password === 'admin123') {
      setAdmin(true)
      setRole(null)
    } else {
      alert(t('home.incorrectPassword', {}, 'Incorrect password'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl">🐑</span>
            <h1 className="text-5xl font-bold text-slate-800">{t('header.appName', {}, 'Little Bo Peep')}</h1>
          </div>
          <p className="text-xl text-slate-600 mb-2">{t('home.tagline', {}, 'Helping sheep get home')}</p>
          <p className="text-slate-500">
            {t('home.description', {}, 'A simple way for countryside walkers to report lost sheep and help farmers recover their flock.')}
          </p>
          {users.length > 0 && (
            <p className="text-sm text-slate-400 mt-2">{t('home.registeredUsers', { count: users.length }, `${users.length} registered users`)}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          <button
            onClick={handleWalkerClick}
            className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500"
          >
            <div className="text-5xl mb-4">🚶</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('home.welcomeWalker', {}, "I'm a Walker")}</h3>
            <p className="text-slate-600">{t('home.walkerDescription', {}, 'Spotted some sheep that look lost? Report their location and help a farmer find them.')}</p>
            <div className="mt-4 text-green-600 font-semibold">{t('home.reportSheepCta', {}, 'Report a sheep →')}</div>
          </button>

          <button
            onClick={handleFarmerClick}
            className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">🧑‍🌾</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('home.welcomeFarmer', {}, "I'm a Farmer")}</h3>
            <p className="text-slate-600">{t('home.farmerDescription', {}, 'Set up your farm fields and receive alerts when sheep are spotted nearby.')}</p>
            <div className="mt-4 text-blue-600 font-semibold">{t('home.manageFarmCta', {}, 'Manage my farm →')}</div>
          </button>
        </div>

        {/* Admin Link */}
        <div className="text-center mb-12">
          <button onClick={handleAdminClick} className="text-slate-400 hover:text-slate-600 text-sm underline">
            {t('header.adminAccess', {}, 'Admin Access')}
          </button>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">{t('home.howItWorks', {}, 'How it works')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">{t('home.step1Title', {}, 'Spot')}</h4>
              <p className="text-slate-600 text-sm">{t('home.step1Description', {}, 'Walker spots sheep that appear lost or out of place')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">{t('home.step2Title', {}, 'Report')}</h4>
              <p className="text-slate-600 text-sm">{t('home.step2Description', {}, 'Submit location and details through the app')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">{t('home.step3Title', {}, 'Reunite')}</h4>
              <p className="text-slate-600 text-sm">{t('home.step3Description', {}, 'Farmer receives alert and recovers their sheep')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-2xl font-bold text-green-600">33M</div>
            <div className="text-sm text-slate-600">{t('home.stat1', {}, 'Sheep in UK')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-2xl font-bold text-green-600">£80M</div>
            <div className="text-sm text-slate-600">{t('home.stat2', {}, 'Annual losses')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-2xl font-bold text-green-600">{t('home.stat3Value', {}, 'Free')}</div>
            <div className="text-sm text-slate-600">{t('home.stat3Label', {}, '30-day trial')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
