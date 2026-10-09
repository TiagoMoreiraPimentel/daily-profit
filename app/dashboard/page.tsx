import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getResumoPorData, getResumoMes } from '@/lib/queries'
import { getStatusPlano } from '@/lib/plano'
import { TransacaoList } from './transacao-list'
import { LogoutButton } from './logout-button'
import { RealtimeRefresh } from './realtime'
import { BannerLimite } from './paywall'
import { AssinarButton } from './assinar-button'
import { DateNavigator } from './date-navigator'
import { BotoesTransacao } from './botoes-transacao'
import { AssinaturaInfo } from './assinatura-info'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
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

  const params = await searchParams
  const hoje = new Date().toISOString().split('T')[0]
  const dataSelecionada = params.data || hoje

  const [resumoDia, resumoMes, statusPlano] = await Promise.all([
    getResumoPorData(dataSelecionada),
    getResumoMes(),
    getStatusPlano(),
  ])

  const ehSuper = plano === 'super'
  const ehPro = plano === 'pro'
  const ehFree = plano === 'free'

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <RealtimeRefresh tenantId={profile.tenant_id} />

      {ehFree &&
        statusPlano?.plano === 'free' &&
        statusPlano.percentual >= 80 &&
        statusPlano.limite && (
          <BannerLimite
            transacoesMes={statusPlano.transacoesMes}
            limite={statusPlano.limite}
          />
        )}

      <AssinaturaInfo />

      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Olá, {profile?.nome || 'usuário'} 👋
          </h1>
          <p className="text-zinc-500 mt-1 text-sm flex items-center gap-2">
            {nomeNegocio}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                ehSuper
                  ? 'bg-purple-100 text-purple-700'
                  : ehPro
                  ? 'bg-green-100 text-green-700'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {ehSuper ? '⭐ Super' : ehPro ? '⭐ Pro' : 'Free'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ehSuper && (
            <Link
              href="/admin"
              className="text-xs px-3 py-2 rounded-md border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-medium"
            >
              🔧 Admin
            </Link>
          )}
          {ehFree && <AssinarButton />}
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

      <div className="mb-6">
        <DateNavigator />
      </div>

      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
        💼 Negócio
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Entrou</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatarMoeda(resumoDia.entrou)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Saiu</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatarMoeda(resumoDia.saiu)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Lucro do dia</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              resumoDia.lucro >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatarMoeda(resumoDia.lucro)}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2 mt-6">
        🏠 Pessoal
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Recebeu</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatarMoeda(resumoDia.entrouPessoal)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Gastou</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatarMoeda(resumoDia.saiuPessoal)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Saldo pessoal</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              resumoDia.pessoalLiquido >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatarMoeda(resumoDia.pessoalLiquido)}
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
                resumoMes.lucro >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(resumoMes.lucro)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Pessoal líquido</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                resumoMes.pessoalLiquido >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(resumoMes.pessoalLiquido)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Sobrou de verdade</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                resumoMes.sobrouDeVerdade >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(resumoMes.sobrouDeVerdade)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Histórico do dia</h2>
        <TransacaoList data={dataSelecionada} tenantId={profile.tenant_id} />
      </div>

      <BotoesTransacao
        tenantId={profile.tenant_id}
        dataSelecionada={dataSelecionada}
      />
    </div>
  )
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent searchParams={searchParams} />
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
      <div className="h-96 bg-zinc-200 rounded" />
    </div>
  )
}