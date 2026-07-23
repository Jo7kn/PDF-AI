'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'subtle' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100'

    const variants = {
      default: 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-violet-400',
      outline: 'border border-white/10 bg-transparent text-slate-200 hover:border-cyan-400/30 hover:bg-white/5',
      ghost: 'bg-transparent text-slate-200 hover:bg-white/10',
      subtle: 'bg-white/10 text-white hover:bg-white/20',
      destructive: 'bg-red-600 text-white hover:bg-red-500',
    }
    
    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin-fast" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }