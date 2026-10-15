'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  icon: string
  show?: boolean
}

export function SidebarNav({
  ehSuper,
  ehFree,
}: {
  ehSuper: boolean
  ehFree: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  const itens: NavItem[] = [
    { href: '/dashboard', label: 'Início', icon: '🏠' },
    { href: '/pro/previsao', label: 'Previsão', icon: '📊' },
    { href: '/pro/relatorio', label: 'Relatório', icon: '📄' },
    { href: '/configuracoes', label: 'Configurações', icon: '⚙️' },
    { href: '/admin', label: 'Admin', icon: '🔧', show: ehSuper },
  ]

  const visiveis = itens.filter((i) => i.show !== false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function estaAtivo(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // =====================================================
  // SIDEBAR DESKTOP (md+)
  // =====================================================
  const SidebarDesktop = (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:h-screen md:sticky md:top-0 bg-white border-r border-zinc-200/80">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-zinc-100">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-zinc-900 tracking-tight"
        >
          Daily Profit
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visiveis.map((item) => {
          const ativo = estaAtivo(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                ativo
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Botão Sair */}
      <div className="p-3 border-t border-zinc-100">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50"
        >
          <span className="text-base">🚪</span>
          <span>{loading ? 'Saindo...' : 'Sair'}</span>
        </button>
      </div>
    </aside>
  )

  // =====================================================
  // BOTTOM NAV MOBILE (< md)
  // =====================================================
  const BottomNavMobile = (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 md:hidden">
      <div className="flex justify-around items-center px-2 py-2">
        {visiveis.slice(0, 4).map((item) => {
          const ativo = estaAtivo(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                ativo ? 'text-emerald-600' : 'text-zinc-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Botão "mais" (abre menu com o resto) */}
        {visiveis.length > 4 && (
          <button
            onClick={() => setMenuAberto(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-zinc-500"
          >
            <span className="text-xl">⋯</span>
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        )}
      </div>
    </nav>
  )

  // =====================================================
  // MENU MOBILE (sheet que sobe)
  // =====================================================
  const MenuMobile = menuAberto && (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:hidden"
      onClick={() => setMenuAberto(false)}
    >
      <div
        className="w-full bg-white rounded-t-2xl p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-4" />

        <div className="space-y-1">
          {visiveis.slice(4).map((item) => {
            const ativo = estaAtivo(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  ativo
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <span className="text-base">🚪</span>
            <span>{loading ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {SidebarDesktop}
      {BottomNavMobile}
      {MenuMobile}
    </>
  )
}