import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getAdminInfo } from '@/lib/admin'
import { AdminContent } from './content'

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 p-8 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      }
    >
      <AdminWrapper />
    </Suspense>
  )
}

async function AdminWrapper() {
  await connection()

  const admin = await getAdminInfo()
  if (!admin) redirect('/dashboard')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: tenants } = await supabaseAdmin
    .from('tenants')
    .select('id, nome_negocio, tipo, plano, criado_em')
    .order('criado_em', { ascending: false })

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('tenant_id, nome, email')

  const { data: transacoes } = await supabaseAdmin
    .from('transactions')
    .select('tenant_id')

  const { data: assinaturas } = await supabaseAdmin
    .from('subscriptions')
    .select('tenant_id, status, proxima_cobranca, ultimo_pagamento')

  const contagemPorTenant: Record<string, number> = {}
  transacoes?.forEach((t) => {
    contagemPorTenant[t.tenant_id] = (contagemPorTenant[t.tenant_id] ?? 0) + 1
  })

  const usuariosPorTenant: Record<string, { nome: string; email: string }> = {}
  users?.forEach((u) => {
    usuariosPorTenant[u.tenant_id] = { nome: u.nome ?? '', email: u.email ?? '' }
  })

  const assinaturasPorTenant: Record<
    string,
    { status: string; proxima_cobranca: string | null; ultimo_pagamento: string | null }
  > = {}
  assinaturas?.forEach((a) => {
    assinaturasPorTenant[a.tenant_id] = {
      status: a.status ?? 'pending',
      proxima_cobranca: a.proxima_cobranca ?? null,
      ultimo_pagamento: a.ultimo_pagamento ?? null,
    }
  })

  const lista = (tenants ?? []).map((t) => ({
    id: t.id,
    nome_negocio: t.nome_negocio,
    tipo: t.tipo,
    plano: t.plano,
    criado_em: t.criado_em,
    dono: usuariosPorTenant[t.id] ?? { nome: '—', email: '—' },
    totalTransacoes: contagemPorTenant[t.id] ?? 0,
    assinatura: assinaturasPorTenant[t.id] ?? null,
  }))

  return <AdminContent admin={admin} tenants={lista} />
}