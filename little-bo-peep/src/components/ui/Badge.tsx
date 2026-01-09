'use client';

import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-stone-100 text-stone-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface TagProps extends React.HTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  disabled?: boolean;
}

export function Tag({
  className,
  selected,
  disabled,
  children,
  ...props
}: TagProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium transition-all duration-200',
        'border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-200',
        selected
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {selected && (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
