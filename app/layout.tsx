import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Daily Profit',
  description: 'Descubra quanto você realmente lucra por dia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans bg-zinc-50 text-zinc-900"
      >
        {children}
      </body>
    </html>
  )
}