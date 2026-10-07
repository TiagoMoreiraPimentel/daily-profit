import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { ExportarCSV } from './exportar-csv'
import { GraficoEvolucao } from './grafico'

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
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  const dataInicio = inicio.toISOString().split('T')[0]
  const dataFim = fim.toISOString().split('T')[0]

  // Busca transações do mês atual
  const { data: transacoes } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza, categoria')
    .gte('data', dataInicio)
    .lte('data', dataFim)

  // Busca transações dos últimos 6 meses (para o gráfico)
  const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1)
  const dataInicio6Meses = seisMesesAtras.toISOString().split('T')[0]

  const { data: transacoes6Meses } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza, data')
    .gte('data', dataInicio6Meses)
    .eq('natureza', 'negocio')

  // Agrupa por mês (últimos 6 meses)
  const porMes: Record<string, { entradas: number; saidas: number }> = {}

  // Inicializa os 6 meses
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    porMes[chave] = { entradas: 0, saidas: 0 }
  }

  transacoes6Meses?.forEach((t) => {
    const chave = t.data.substring(0, 7) // YYYY-MM
    if (!porMes[chave]) return
    if (t.tipo === 'entrada') porMes[chave].entradas += Number(t.valor)
    else porMes[chave].saidas += Number(t.valor)
  })

  // Prepara dados do gráfico (ordem cronológica)
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

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

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
          <ExportarCSV dados={dados} mes={mesAtual} />
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

        {/* Gráfico de evolução */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
            📈 Evolução dos últimos 6 meses
          </p>
          <GraficoEvolucao dados={dados.dadosGrafico} />
        </div>

        {/* Por categoria */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
            Por categoria (negócio)
          </p>
          {Object.keys(dados.porCategoria).length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              Nenhuma transação de negócio registrada neste mês.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {Object.entries(dados.porCategoria).map(([cat, valores]) => {
                const saldo = valores.entrada - valores.saida
                return (
                  <li key={cat} className="py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-900">{cat}</span>
                    <span
                      className={`text-sm font-semibold ${
                        saldo >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatarMoeda(saldo)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}