import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
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

  const supabase = await createClient()

  // Busca todos os tenants
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, nome_negocio, tipo, plano, criado_em')
    .order('criado_em', { ascending: false })

  // Busca usuários donos
  const { data: users } = await supabase
    .from('users')
    .select('tenant_id, nome, email')

  // Busca contagem de transações por tenant
  const { data: transacoes } = await supabase
    .from('transactions')
    .select('tenant_id')

  // Busca assinaturas
  const { data: assinaturas } = await supabase
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