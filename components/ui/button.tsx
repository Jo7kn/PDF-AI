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
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-[transform,background-color,border-color,box-shadow] duration-200 ease-spring active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100'

    const variants = {
      default: 'bg-brand text-white shadow-[0_0_0_1px_rgba(94,106,210,0.4),0_8px_24px_-8px_rgba(94,106,210,0.6)] hover:bg-[#6D79E0]',
      outline: 'border border-white/[0.08] bg-transparent text-neutral-200 hover:border-white/[0.14] hover:bg-white/[0.04]',
      ghost: 'bg-transparent text-neutral-200 hover:bg-white/[0.06]',
      subtle: 'bg-white/[0.06] text-white hover:bg-white/[0.1]',
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