import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getResumoHoje, getResumoMes } from '@/lib/queries'
import { getStatusPlano } from '@/lib/plano'
import { TransacaoForm } from './transacao-form'
import { TransacaoList } from './transacao-list'
import { LogoutButton } from './logout-button'
import { RealtimeRefresh } from './realtime'
import { BannerLimite } from './paywall'
import { AssinarButton } from './assinar-button'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

async function DashboardContent() {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('nome, tenant_id, tenants(nome_negocio, plano)')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return <p className="text-red-600">Erro: perfil sem tenant associado.</p>
  }

  const nomeNegocio = (profile?.tenants as { nome_negocio?: string; plano?: string } | null)?.nome_negocio
  const plano = (profile?.tenants as { nome_negocio?: string; plano?: string } | null)?.plano ?? 'free'

  const [hoje, mes, statusPlano] = await Promise.all([
    getResumoHoje(),
    getResumoMes(),
    getStatusPlano(),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <RealtimeRefresh tenantId={profile.tenant_id} />

      {statusPlano?.plano === 'free' &&
        statusPlano.percentual >= 80 &&
        statusPlano.limite && (
          <BannerLimite
            transacoesMes={statusPlano.transacoesMes}
            limite={statusPlano.limite}
          />
        )}

      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Olá, {profile?.nome || 'usuário'} 👋
          </h1>
          <p className="text-zinc-500 mt-1 text-sm flex items-center gap-2">
            {nomeNegocio}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                plano === 'pro'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {plano === 'pro' ? '⭐ Pro' : 'Free'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {plano === 'free' && <AssinarButton />}
          <Link
            href="/pro/previsao"
            className="text-xs px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 transition"
          >
            📊 Previsão
          </Link>
          <Link
            href="/pro/relatorio"
            className="text-xs px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 transition"
          >
            📄 Relatório
          </Link>
          <LogoutButton />
        </div>
      </div>

      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
        💼 Negócio hoje
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Entrou</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatarMoeda(hoje.entrou)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Saiu</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatarMoeda(hoje.saiu)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Lucro do dia</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              hoje.lucro >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatarMoeda(hoje.lucro)}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2 mt-6">
        🏠 Pessoal hoje
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Recebeu</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatarMoeda(hoje.entrouPessoal)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Gastou</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatarMoeda(hoje.saiuPessoal)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Saldo pessoal</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              hoje.pessoalLiquido >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatarMoeda(hoje.pessoalLiquido)}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mb-6">
        O que é marcado como &quot;pessoal&quot; não entra no lucro do negócio. É o
        seu dinheiro de fora do trabalho.
      </p>

      <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
          Resumo do mês até agora
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-zinc-500">Lucro do negócio</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                mes.lucro >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(mes.lucro)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Pessoal líquido</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                mes.pessoalLiquido >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(mes.pessoalLiquido)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Sobrou de verdade</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                mes.sobrouDeVerdade >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(mes.sobrouDeVerdade)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Registrar transação
          </h2>
          <TransacaoForm tenantId={profile.tenant_id} />
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Hoje</h2>
          <TransacaoList />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-zinc-200 rounded w-64 mb-2" />
      <div className="h-4 bg-zinc-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="h-24 bg-zinc-200 rounded" />
        <div className="h-24 bg-zinc-200 rounded" />
        <div className="h-24 bg-zinc-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="h-24 bg-zinc-200 rounded" />
        <div className="h-24 bg-zinc-200 rounded" />
        <div className="h-24 bg-zinc-200 rounded" />
      </div>
      <div className="h-40 bg-zinc-200 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-96 bg-zinc-200 rounded" />
        <div className="h-96 bg-zinc-200 rounded" />
      </div>
    </div>
  )
}