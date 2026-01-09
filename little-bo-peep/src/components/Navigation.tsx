'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Plus, Bell, Settings, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const walkerNav: NavItem[] = [
  { href: '/walker', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { href: '/walker/report', label: 'Report', icon: <Plus className="w-5 h-5" /> },
  { href: '/walker/my-reports', label: 'My Reports', icon: <User className="w-5 h-5" /> },
];

const farmerNav: NavItem[] = [
  { href: '/farmer', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
  { href: '/farmer/holding', label: 'Holding', icon: <Home className="w-5 h-5" /> },
  { href: '/farmer/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface NavigationProps {
  variant: 'walker' | 'farmer';
}

export function Navigation({ variant }: NavigationProps) {
  const pathname = usePathname();
  const items = variant === 'walker' ? walkerNav : farmerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 safe-area-bottom">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                  isActive
                    ? 'text-emerald-600'
                    : 'text-stone-400 hover:text-stone-600'
                )}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isWalker = pathname.startsWith('/walker');
  const isFarmer = pathname.startsWith('/farmer');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐑</span>
            <span className="font-bold text-stone-900 text-lg">Little Bo Peep</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/walker"
              className={cn(
                'font-medium transition-colors',
                isWalker ? 'text-emerald-600' : 'text-stone-600 hover:text-stone-900'
              )}
            >
              I'm a Walker
            </Link>
            <Link
              href="/farmer"
              className={cn(
                'font-medium transition-colors',
                isFarmer ? 'text-emerald-600' : 'text-stone-600 hover:text-stone-900'
              )}
            >
              I'm a Farmer
            </Link>
            <Link
              href="/about"
              className="font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-stone-700" />
            ) : (
              <Menu className="w-6 h-6 text-stone-700" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white">
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/walker"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-xl font-medium transition-colors',
                  isWalker
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                I'm a Walker
              </Link>
              <Link
                href="/farmer"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-xl font-medium transition-colors',
                  isFarmer
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-stone-600 hover:bg-stone-50'
                )}
              >
                I'm a Farmer
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </header>
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
