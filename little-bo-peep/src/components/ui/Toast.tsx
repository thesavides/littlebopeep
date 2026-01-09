'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store';

export function Toast() {
  const { toast, hideToast } = useUIStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(hideToast, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />,
  };

  const styles = {
    success: 'border-emerald-200 bg-emerald-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-sky-200 bg-sky-50',
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-lg max-w-md ml-auto',
          styles[toast.type]
        )}
      >
        {icons[toast.type]}
        <p className="flex-1 text-stone-800 font-medium">{toast.message}</p>
        <button
          onClick={hideToast}
          className="p-1 rounded-full hover:bg-white/50 transition-colors"
        >
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>
    </div>
  );
}
