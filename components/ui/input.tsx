import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:bg-zinc-50 ${className}`}
      {...props}
    />
  )
})
Input.displayName = 'Input'