'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toast } from '@/components/ui/Toast';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { LogOut } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const showHeader = pathname !== '/' && pathname !== '/auth';

  return (
    <html lang="en">
      <body>
        {showHeader && user && (
          <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
              <button 
                onClick={() => router.push('/')}
                className="text-lg font-semibold text-emerald-600 hover:text-emerald-700"
              >
                🐑 Little Bo Peep
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-stone-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>
        )}
        
        {children}
        <Toast />
      </body>
    </html>
  );
}
