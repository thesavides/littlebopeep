'use client'

import { useTranslation } from '@/contexts/TranslationContext'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D1D9C5' }}>

      <SiteNav />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-4 text-center">
        <p
          className="inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ backgroundColor: 'rgba(125,141,204,0.15)', color: '#7D8DCC' }}
        >
          {t('about.eyebrow', {}, 'Real-time countryside reporting')}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl leading-snug" style={{ color: '#614270' }}>
          {t('about.title', {}, 'About Little Bo Peep & Its Founder')}
        </h1>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-12">
        <div
          className="rounded-2xl p-6 sm:p-10 text-base leading-relaxed space-y-5"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(146,153,139,0.3)', color: '#3e2c48' }}
        >
          <p>
            {t('about.p1', {}, 'Little Bo Peep began with a simple idea from')} <strong style={{ color: '#614270' }}>Jessica Whitcutt</strong>{t('about.p1b', {}, ', shaped through time spent walking the Welsh countryside near Llanrwst.')}
          </p>
          <p>{t('about.p2', {}, 'What she experienced there is not unique to Wales. It is simply where the idea became clear.')}</p>
          <p>{t('about.p3', {}, 'Across rural landscapes, the same patterns exist. Livestock roam freely. Land stretches across vast areas. Things go wrong. Animals get into trouble. Fences break. Trees fall. And often, farmers are simply not aware in the moment, not through lack of care or effort, but because of the sheer scale of what they are managing.')}</p>
          <p>{t('about.p4', {}, 'At the same time, there are people moving through these spaces every day. Walkers, ramblers, and nature lovers who notice what is happening around them and who would help if there were a simple, direct way to do so.')}</p>
          <p className="font-semibold" style={{ color: '#614270' }}>
            {t('about.tagline', {}, 'Little Bo Peep connects those two worlds.')}
          </p>
          <p>{t('about.p5', {}, 'It allows anyone out walking to quickly report what they see. A pinned location, a photo, and a short description are sent directly to the people who need to know. For farmers, this acts as a prompt, an extra set of eyes across their land, helping surface issues sooner so they can act faster.')}</p>
          <p>{t('about.p6', {}, 'Importantly, farmers stay in control. They can define their land, choose exactly what they want to be notified about, and filter the type of reports they receive so the system remains useful rather than overwhelming.')}</p>
          <p>{t('about.p7', {}, 'While the name may reference sheep, the platform is designed for all livestock, infrastructure such as fences and gates, and environmental issues like fallen trees or blocked paths.')}</p>
          <p>{t('about.p8', {}, 'From the beginning, Jessica has approached this as a shared, community-driven effort. The goal is to create a practical partnership between walkers, farmers, and everyone connected to the countryside, bringing better balance and awareness to how land is used and cared for.')}</p>
          <p>{t('about.p9', {}, 'To reflect the broader reach of the problem, Little Bo Peep is being developed with localisation in mind, including support for regional UK languages, ensuring it can be used naturally by the communities it is built for.')}</p>
          <p>{t('about.p10', {}, 'This is not a profit-driven project. Keeping it accessible and as close to cost-free as possible is a priority. To make that sustainable, Jessica is actively seeking partnerships with organisations connected to rural life, from agricultural suppliers to technology and mapping partners.')}</p>
          <p>{t('about.p11', {}, 'If you are interested in supporting, sponsoring, or collaborating, you are invited to get involved.')}</p>

          {/* Contact CTA */}
          <div className="pt-4 flex flex-col items-center gap-2">
            <a
              href="mailto:info@littlebopeep.app"
              className="rounded-full px-6 py-3 text-sm font-semibold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              {t('about.cta', {}, 'Get in touch at info@littlebopeep.app')}
            </a>
          </div>

          {/* Closing */}
          <div
            className="mt-6 pt-6 text-center italic"
            style={{ borderTop: '1px solid rgba(146,153,139,0.3)', color: '#614270' }}
          >
            <p>{t('about.closing1', {}, 'Little Bo Peep is built on a simple idea.')}</p>
            <p>{t('about.closing2', {}, 'The people already walking the land can help look after it.')}</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
