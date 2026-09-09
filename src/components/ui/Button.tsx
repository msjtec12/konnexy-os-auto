import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'warning' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100 select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4 py-2.5 text-sm font-semibold gap-2",
    lg: "px-6 py-3.5 text-base font-bold gap-2.5",
    icon: "p-2.5 w-10 h-10 flex items-center justify-center",
  };

  const variantStyles = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 border border-slate-200",
    outline: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 focus:ring-primary-500 shadow-xs",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
    warning: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#1EBE5D] focus:ring-emerald-400 shadow-sm font-bold",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
