import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-server'
import { getResumoPorData, getResumoMes } from '@/lib/queries'
import { getStatusPlano } from '@/lib/plano'
import { TransacaoList } from './transacao-list'
import { RealtimeRefresh } from './realtime'
import { BannerLimite } from './paywall'
import { AssinarButton } from './assinar-button'
import { DateNavigator } from './date-navigator'
import { BotoesTransacao } from './botoes-transacao'
import { AssinaturaInfo } from './assinatura-info'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { AppFooter } from '@/components/app-footer'

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
    .select('nome, tenant_id, tenants(nome_negocio, plano, plano_vencimento)')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return <p className="text-red-600">Erro: perfil sem tenant associado.</p>
  }

  const nomeNegocio = (profile?.tenants as { nome_negocio?: string } | null)?.nome_negocio
  let plano = (profile?.tenants as { plano?: string; plano_vencimento?: string } | null)?.plano ?? 'free'
  const planoVencimento = (profile?.tenants as { plano_vencimento?: string } | null)?.plano_vencimento

  // Verifica vencimento
  if (plano === 'pro' && planoVencimento) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const [ano, mes, dia] = planoVencimento.split('-').map(Number)
    const dataVenc = new Date(ano, mes - 1, dia)
    dataVenc.setHours(0, 0, 0, 0)

    if (dataVenc < hoje) {
      try {
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
        await supabaseAdmin
          .from('tenants')
          .update({ plano: 'free', plano_vencimento: null })
          .eq('id', profile.tenant_id)
        plano = 'free'
      } catch (e) {
        console.error('Erro ao expirar plano:', e)
      }
    }
  }

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
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
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

      {/* HEADER — só saudação */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Olá, {nomeNegocio || 'usuário'} 👋
        </h1>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              ehSuper
                ? 'bg-violet-100 text-violet-700'
                : ehPro
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {ehSuper ? '⭐ Super' : ehPro ? '⭐ Pro' : 'Free'}
          </span>
          {ehFree && <AssinarButton />}
        </div>
      </div>

      {/* DATE NAVIGATOR */}
      <div className="mb-6">
        <DateNavigator />
      </div>

      {/* CARDS — NEGÓCIO */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">💼</span>
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
          Negócio
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Entrou
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              ↑
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 tracking-tight">
            {formatarMoeda(resumoDia.entrou)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Saiu
            </p>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm">
              ↓
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 tracking-tight">
            {formatarMoeda(resumoDia.saiu)}
          </p>
        </div>

        <div
          className={`rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
            resumoDia.lucro >= 0
              ? 'bg-emerald-50 border-emerald-100'
              : 'bg-red-50 border-red-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className={`text-xs font-medium uppercase tracking-wider ${
                resumoDia.lucro >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              Lucro do dia
            </p>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                resumoDia.lucro >= 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              💰
            </div>
          </div>
          <p
            className={`text-3xl font-bold tracking-tight ${
              resumoDia.lucro >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {formatarMoeda(resumoDia.lucro)}
          </p>
        </div>
      </div>

      {/* CARDS — PESSOAL */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">🏠</span>
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
          Pessoal
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">
            Recebeu
          </p>
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">
            {formatarMoeda(resumoDia.entrouPessoal)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">
            Gastou
          </p>
          <p className="text-2xl font-bold text-amber-600 tracking-tight">
            {formatarMoeda(resumoDia.saiuPessoal)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">
            Saldo pessoal
          </p>
          <p
            className={`text-2xl font-bold tracking-tight ${
              resumoDia.pessoalLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatarMoeda(resumoDia.pessoalLiquido)}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mb-8">
        O que é marcado como <strong>pessoal</strong> não entra no lucro do negócio.
      </p>

      {/* RESUMO DO MÊS */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl shadow-sm p-6 mb-8 text-white">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-4">
          📅 Resumo do mês até agora
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-zinc-400 mb-1">Lucro do negócio</p>
            <p
              className={`text-2xl font-bold tracking-tight ${
                resumoMes.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatarMoeda(resumoMes.lucro)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Pessoal líquido</p>
            <p
              className={`text-2xl font-bold tracking-tight ${
                resumoMes.pessoalLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatarMoeda(resumoMes.pessoalLiquido)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Sobrou de verdade</p>
            <p
              className={`text-3xl font-bold tracking-tight ${
                resumoMes.sobrouDeVerdade >= 0 ? 'text-white' : 'text-red-400'
              }`}
            >
              {formatarMoeda(resumoMes.sobrouDeVerdade)}
            </p>
          </div>
        </div>
      </div>

      {/* HISTÓRICO */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">📋</span>
          <h2 className="text-base font-semibold text-zinc-900">
            Histórico do dia
          </h2>
        </div>
        <TransacaoList data={dataSelecionada} tenantId={profile.tenant_id} />
      </div>

      <BotoesTransacao
        tenantId={profile.tenant_id}
        dataSelecionada={dataSelecionada}
      />

      <AppFooter />

      <WhatsAppButton posicao="direita" tamanho="pequeno" />
    </div>
  )
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-pulse">
      <div className="h-8 bg-zinc-200 rounded-lg w-64 mb-2" />
      <div className="h-6 bg-zinc-200 rounded-lg w-24 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="h-32 bg-zinc-200 rounded-xl" />
        <div className="h-32 bg-zinc-200 rounded-xl" />
        <div className="h-32 bg-zinc-200 rounded-xl" />
      </div>
      <div className="h-40 bg-zinc-200 rounded-xl mb-8" />
      <div className="h-96 bg-zinc-200 rounded-xl" />
    </div>
  )
}