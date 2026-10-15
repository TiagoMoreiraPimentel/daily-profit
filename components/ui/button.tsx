import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'brand' | 'danger'
  size?: 'default' | 'sm' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

    const variants = {
      default:
        'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm',
      brand:
        'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20',
      danger:
        'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      outline:
        'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400',
      ghost:
        'text-zinc-900 hover:bg-zinc-100',
    }

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'