import { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/80 bg-white shadow-sm ${className}`}
      {...props}
    />
  )
}

export function CardHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 pb-3 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-base font-semibold text-zinc-900 ${className}`} {...props} />
}

export function CardDescription({
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-zinc-500 mt-0.5 ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 pt-0 ${className}`} {...props} />
}

export function CardFooter({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 pt-0 flex items-center ${className}`} {...props} />
}