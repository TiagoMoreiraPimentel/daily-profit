import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { SidebarNav } from '@/components/sidebar-nav'

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  )
}

async function LayoutContent({ children }: { children: React.ReactNode }) {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('tenants(plano)')
    .eq('id', user.id)
    .single()

  const plano = (profile?.tenants as { plano?: string } | null)?.plano ?? 'free'

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <SidebarNav ehSuper={plano === 'super'} ehFree={plano === 'free'} />
      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        {children}
      </main>
    </div>
  )
}

function LayoutSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <div className="hidden md:block md:w-56 md:bg-white md:border-r md:border-zinc-200/80" />
      <div className="flex-1 p-8 animate-pulse">
        <div className="h-8 bg-zinc-200 rounded-lg w-64 mb-4" />
        <div className="h-32 bg-zinc-200 rounded-xl" />
      </div>
    </div>
  )
}