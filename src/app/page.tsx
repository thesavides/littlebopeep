import Link from 'next/link';
import { TopNav } from '@/components/Navigation';

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <div className="text-7xl md:text-8xl mb-8 animate-fade-in">🐑</div>
              <h1 className="text-4xl md:text-6xl font-bold text-stone-900 mb-6 animate-slide-up">
                Helping sheep
                <span className="text-emerald-600"> get home</span>
              </h1>
              <p className="text-xl text-stone-600 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                A simple app connecting countryside walkers with local farmers. 
                Spot a lost sheep? Report it in seconds. Farmers get instant alerts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link
                  href="/walker"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-semibold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all hover:scale-105"
                >
                  <span>I&apos;m a Walker</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/farmer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-stone-900 text-white font-semibold text-lg shadow-lg hover:bg-stone-800 transition-all hover:scale-105"
                >
                  <span>I&apos;m a Farmer</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-stone-900 mb-16">
              Simple as 1, 2, 3
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  icon: '👀',
                  title: 'Spot a sheep',
                  description: 'On a walk and see a sheep that looks lost or out of place? Open the app.',
                },
                {
                  step: '2',
                  icon: '📍',
                  title: 'Drop a pin',
                  description: 'Mark the location, snap a photo if you can, and add any helpful details.',
                },
                {
                  step: '3',
                  icon: '🔔',
                  title: 'Farmer alerted',
                  description: 'Nearby farmers with matching areas receive an instant notification.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center p-8 rounded-3xl bg-stone-50 hover:bg-stone-100 transition-colors">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl mb-6">
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-stone-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                  Why Little Bo Peep?
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: 'Animal Welfare',
                      description: 'Faster recovery means less stress for lost animals and reduced risk of injury.',
                    },
                    {
                      title: 'Farmer Peace of Mind',
                      description: 'Real-time alerts when someone spots your sheep, anywhere in your area.',
                    },
                    {
                      title: 'Community Connection',
                      description: 'Bridging the gap between walkers and farmers who share the countryside.',
                    },
                    {
                      title: 'No Hardware Needed',
                      description: 'Just your phone. No expensive trackers or collars required.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-900">{item.title}</h3>
                        <p className="text-stone-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-100 to-amber-50 flex items-center justify-center">
                  <div className="text-[150px] animate-fade-in">🐑</div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">98%</div>
                    <div className="text-sm text-stone-500">Recovery rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-emerald-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to help?
            </h2>
            <p className="text-xl text-emerald-100 mb-10">
              Whether you walk the hills or farm them, Little Bo Peep connects you with your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/walker"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-emerald-600 font-semibold text-lg hover:bg-emerald-50 transition-colors"
              >
                Start Reporting
              </Link>
              <Link
                href="/farmer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-700 text-white font-semibold text-lg hover:bg-emerald-800 transition-colors"
              >
                Register as a Farmer
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-stone-900 text-stone-400">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐑</span>
                <span className="font-bold text-white">Little Bo Peep</span>
              </div>
              <nav className="flex gap-6">
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </nav>
              <p className="text-sm">© 2024 Little Bo Peep</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
