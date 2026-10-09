import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { AppFooter } from '@/components/app-footer'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

async function buscarPrevisao() {
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
  const anoAtual = hoje.getFullYear()
  const mesAtual = hoje.getMonth()
  const diaAtual = hoje.getDate()
  const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0).getDate()

  const primeiroDiaMesAtual = new Date(anoAtual, mesAtual, 1)
  const dataInicioAtual = primeiroDiaMesAtual.toISOString().split('T')[0]

  const { data: transacoesMesAtual } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza')
    .gte('data', dataInicioAtual)

  const entradasMesAtual =
    transacoesMesAtual
      ?.filter((t) => t.tipo === 'entrada' && t.natureza === 'negocio')
      .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const saidasMesAtual =
    transacoesMesAtual
      ?.filter((t) => t.tipo === 'saida' && t.natureza === 'negocio')
      .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const ritmoEntradas =
    diaAtual > 0 ? (entradasMesAtual / diaAtual) * ultimoDiaMes : 0
  const ritmoSaidas = diaAtual > 0 ? (saidasMesAtual / diaAtual) * ultimoDiaMes : 0

  const tresMesesAtras = new Date(anoAtual, mesAtual - 3, 1)
  const dataInicio3Meses = tresMesesAtras.toISOString().split('T')[0]
  const ultimoDiaMesAnterior = new Date(anoAtual, mesAtual, 0)
  const dataFim3Meses = ultimoDiaMesAnterior.toISOString().split('T')[0]

  const { data: transacoes3Meses } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza, data')
    .gte('data', dataInicio3Meses)
    .lte('data', dataFim3Meses)

  const porMes: Record<string, { entradas: number; saidas: number }> = {}
  transacoes3Meses
    ?.filter((t) => t.natureza === 'negocio')
    .forEach((t) => {
      const mes = t.data.substring(0, 7)
      if (!porMes[mes]) porMes[mes] = { entradas: 0, saidas: 0 }
      if (t.tipo === 'entrada') porMes[mes].entradas += Number(t.valor)
      else porMes[mes].saidas += Number(t.valor)
    })

  const mesesComDados = Object.values(porMes)
  const qtdMeses = mesesComDados.length

  const mediaEntradas =
    qtdMeses > 0
      ? mesesComDados.reduce((acc, m) => acc + m.entradas, 0) / qtdMeses
      : 0
  const mediaSaidas =
    qtdMeses > 0
      ? mesesComDados.reduce((acc, m) => acc + m.saidas, 0) / qtdMeses
      : 0

  const { data: recorrentes } = await supabase
    .from('recurring')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .eq('ativo', true)

  const recorrentesEntradas =
    recorrentes
      ?.filter((r) => r.tipo === 'entrada')
      .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0
  const recorrentesSaidas =
    recorrentes
      ?.filter((r) => r.tipo === 'saida')
      .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0

  const pesoMedia = qtdMeses >= 2 ? 0.7 : 0.3
  const pesoRitmo = 1 - pesoMedia

  const previsaoEntradas =
    mediaEntradas * pesoMedia + ritmoEntradas * pesoRitmo + recorrentesEntradas
  const previsaoSaidas =
    mediaSaidas * pesoMedia + ritmoSaidas * pesoRitmo + recorrentesSaidas

  return {
    realizadoMes: {
      entradas: entradasMesAtual,
      saidas: saidasMesAtual,
      lucro: entradasMesAtual - saidasMesAtual,
    },
    mediaHistorica: {
      entradas: mediaEntradas,
      saidas: mediaSaidas,
      lucro: mediaEntradas - mediaSaidas,
      mesesConsiderados: qtdMeses,
    },
    ritmoAtual: {
      entradas: ritmoEntradas,
      saidas: ritmoSaidas,
      lucro: ritmoEntradas - ritmoSaidas,
    },
    recorrentes: {
      entradas: recorrentesEntradas,
      saidas: recorrentesSaidas,
      lista: recorrentes ?? [],
    },
    previsaoProximoMes: {
      entradas: previsaoEntradas,
      saidas: previsaoSaidas,
      lucro: previsaoEntradas - previsaoSaidas,
    },
    diasDecorridos: diaAtual,
    diasNoMes: ultimoDiaMes,
  }
}

export async function PrevisaoContent() {
  const dados = await buscarPrevisao()

  if (!dados) {
    return <p className="text-red-600">Erro ao carregar previsão.</p>
  }

  const semDados =
    dados.mediaHistorica.mesesConsiderados === 0 &&
    dados.realizadoMes.entradas === 0 &&
    dados.realizadoMes.saidas === 0

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
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Previsão de Caixa</h1>
            <p className="text-zinc-500 text-sm">
              Estimativa para o próximo mês com base no histórico + tendência atual
            </p>
          </div>
          <Link
            href="/pro/recorrentes"
            className="text-xs px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 transition"
          >
            ⚙️ Gerenciar recorrentes
          </Link>
        </div>

        {semDados && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
            💡 Ainda não temos dados suficientes para uma previsão precisa. Registre
            transações e cadastre contas recorrentes para ver resultados melhores.
          </div>
        )}

        <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
            📈 Previsão para o próximo mês
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-zinc-500">Entradas previstas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {formatarMoeda(dados.previsaoProximoMes.entradas)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Saídas previstas</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {formatarMoeda(dados.previsaoProximoMes.saidas)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Lucro previsto</p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  dados.previsaoProximoMes.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatarMoeda(dados.previsaoProximoMes.lucro)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
            Como calculamos
          </p>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-zinc-900 mb-2">
                🚀 Ritmo do mês atual
              </p>
              <p className="text-xs text-zinc-500 mb-3">
                Você está no dia {dados.diasDecorridos} de {dados.diasNoMes}. Se
                mantiver esse ritmo, o mês fechará em:
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Entradas</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {formatarMoeda(dados.ritmoAtual.entradas)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Saídas</p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {formatarMoeda(dados.ritmoAtual.saidas)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Lucro</p>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      dados.ritmoAtual.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatarMoeda(dados.ritmoAtual.lucro)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-900 mb-2">
                📊 Média dos últimos 3 meses
              </p>
              <p className="text-xs text-zinc-500 mb-3">
                {dados.mediaHistorica.mesesConsiderados > 0
                  ? `Consideramos ${dados.mediaHistorica.mesesConsiderados} mês(es) com dados.`
                  : 'Ainda não temos histórico suficiente.'}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Entradas</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {formatarMoeda(dados.mediaHistorica.entradas)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Saídas</p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {formatarMoeda(dados.mediaHistorica.saidas)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Lucro</p>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      dados.mediaHistorica.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatarMoeda(dados.mediaHistorica.lucro)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-900 mb-2">
                🔁 Contas recorrentes
              </p>
              <p className="text-xs text-zinc-500 mb-3">
                {dados.recorrentes.lista.length > 0
                  ? `${dados.recorrentes.lista.length} conta(s) cadastrada(s).`
                  : 'Nenhuma conta recorrente cadastrada ainda.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Entradas fixas</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    +{formatarMoeda(dados.recorrentes.entradas)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded p-3">
                  <p className="text-xs text-zinc-500">Saídas fixas</p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    −{formatarMoeda(dados.recorrentes.saidas)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
            📅 Mês atual até agora
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-zinc-500">Entrou</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatarMoeda(dados.realizadoMes.entradas)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Saiu</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {formatarMoeda(dados.realizadoMes.saidas)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Lucro</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  dados.realizadoMes.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatarMoeda(dados.realizadoMes.lucro)}
              </p>
            </div>
          </div>
        </div>

        <AppFooter />
      </div>

      <WhatsAppButton posicao="esquerda" tamanho="pequeno" />
    </div>
  )
}