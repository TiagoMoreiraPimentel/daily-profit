import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { ExportarCSV } from './exportar-csv'
import { GraficoEvolucao } from './grafico'
import { GraficoEntradasSaidas } from './grafico-entradas-saidas'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { AppFooter } from '@/components/app-footer'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

async function buscarRelatorio() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, tenants(nome_negocio)')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const nomeNegocio =
    (profile.tenants as { nome_negocio?: string } | null)?.nome_negocio ??
    'Meu Negócio'

  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  const dataInicio = inicio.toISOString().split('T')[0]
  const dataFim = fim.toISOString().split('T')[0]

  const { data: transacoes } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza, categoria')
    .gte('data', dataInicio)
    .lte('data', dataFim)

  const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1)
  const dataInicio6Meses = seisMesesAtras.toISOString().split('T')[0]

  const { data: transacoes6Meses } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza, data')
    .gte('data', dataInicio6Meses)
    .eq('natureza', 'negocio')

  const porMes: Record<string, { entradas: number; saidas: number }> = {}

  for (let i = 0; i < 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    porMes[chave] = { entradas: 0, saidas: 0 }
  }

  transacoes6Meses?.forEach((t) => {
    const chave = t.data.substring(0, 7)
    if (!porMes[chave]) return
    if (t.tipo === 'entrada') porMes[chave].entradas += Number(t.valor)
    else porMes[chave].saidas += Number(t.valor)
  })

  const dadosGrafico = Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => ({
      mes,
      entradas: v.entradas,
      saidas: v.saidas,
      lucro: v.entradas - v.saidas,
    }))

  const negocio = transacoes?.filter((t) => t.natureza === 'negocio') ?? []
  const pessoal = transacoes?.filter((t) => t.natureza === 'pessoal') ?? []

  const entrouNegocio = negocio
    .filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + Number(t.valor), 0)
  const saiuNegocio = negocio
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Number(t.valor), 0)
  const entrouPessoal = pessoal
    .filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + Number(t.valor), 0)
  const saiuPessoal = pessoal
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const porCategoria: Record<string, { entrada: number; saida: number }> = {}
  negocio.forEach((t) => {
    const cat = t.categoria || 'Sem categoria'
    if (!porCategoria[cat]) porCategoria[cat] = { entrada: 0, saida: 0 }
    if (t.tipo === 'entrada') porCategoria[cat].entrada += Number(t.valor)
    else porCategoria[cat].saida += Number(t.valor)
  })

  return {
    nomeNegocio,
    negocio: {
      entrou: entrouNegocio,
      saiu: saiuNegocio,
      lucro: entrouNegocio - saiuNegocio,
    },
    pessoal: {
      entrou: entrouPessoal,
      saiu: saiuPessoal,
      liquido: entrouPessoal - saiuPessoal,
    },
    sobrouDeVerdade: entrouNegocio - saiuNegocio + entrouPessoal - saiuPessoal,
    porCategoria,
    dadosGrafico,
  }
}

export async function RelatorioContent() {
  const dados = await buscarRelatorio()

  if (!dados) {
    return <p className="text-red-600">Erro ao carregar relatório.</p>
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const categoriasOrdenadas = Object.entries(dados.porCategoria)
    .map(([nome, valores]) => ({
      nome,
      entrada: valores.entrada,
      saida: valores.saida,
      saldo: valores.entrada - valores.saida,
    }))
    .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo))

  const maiorAbsoluto =
    categoriasOrdenadas.length > 0
      ? Math.max(...categoriasOrdenadas.map((c) => Math.abs(c.saldo)), 1)
      : 1

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Voltar ao dashboard
          </Link>
        </div>

        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Relatório Mensal</h1>
            <p className="text-zinc-500 text-sm capitalize">{mesAtual}</p>
          </div>
          <ExportarCSV
            dados={dados}
            mes={mesAtual}
            nomeNegocio={dados.nomeNegocio}
          />
        </div>

        {/* Gráfico de entradas vs. saídas */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-6">
            🥧 Entradas e saídas do mês
          </p>
          <GraficoEntradasSaidas
            entradas={dados.negocio.entrou}
            saidas={dados.negocio.saiu}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Lucro do negócio</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                dados.negocio.lucro >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(dados.negocio.lucro)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Pessoal líquido</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                dados.pessoal.liquido >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(dados.pessoal.liquido)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Sobrou de verdade</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                dados.sobrouDeVerdade >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(dados.sobrouDeVerdade)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
            📈 Evolução dos últimos 6 meses
          </p>
          <GraficoEvolucao dados={dados.dadosGrafico} />
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-6">
            📊 Por categoria (negócio)
          </p>

          {categoriasOrdenadas.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              Nenhuma transação de negócio registrada neste mês.
            </p>
          ) : (
            <div className="space-y-4">
              {categoriasOrdenadas.map((cat) => {
                const percentual = (Math.abs(cat.saldo) / maiorAbsoluto) * 100
                const positivo = cat.saldo >= 0

                return (
                  <div key={cat.nome}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-zinc-900 truncate pr-3">
                        {cat.nome}
                      </span>
                      <span
                        className={`font-semibold whitespace-nowrap ${
                          positivo ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {positivo ? '+' : '−'} {formatarMoeda(Math.abs(cat.saldo))}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          positivo ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <AppFooter />
      </div>

      <WhatsAppButton posicao="esquerda" tamanho="pequeno" />
    </div>
  )
}