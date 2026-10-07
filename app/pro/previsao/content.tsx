import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

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

  const primeiroDiaMes = new Date()
  primeiroDiaMes.setDate(1)
  const dataInicio = primeiroDiaMes.toISOString().split('T')[0]

  const { data: transacoes } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza')
    .gte('data', dataInicio)

  const { data: recorrentes } = await supabase
    .from('recurring')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .eq('ativo', true)

  const entradasMes =
    transacoes
      ?.filter((t) => t.tipo === 'entrada' && t.natureza === 'negocio')
      .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const saidasMes =
    transacoes
      ?.filter((t) => t.tipo === 'saida' && t.natureza === 'negocio')
      .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const entradasRec =
    recorrentes
      ?.filter((r) => r.tipo === 'entrada')
      .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0

  const saidasRec =
    recorrentes
      ?.filter((r) => r.tipo === 'saida')
      .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0

  return {
    realizado: {
      entradas: entradasMes,
      saidas: saidasMes,
      lucro: entradasMes - saidasMes,
    },
    previsto: {
      entradas: entradasRec,
      saidas: saidasRec,
    },
    projecao: {
      entradas: entradasMes + entradasRec,
      saidas: saidasMes + saidasRec,
      lucro: entradasMes + entradasRec - (saidasMes + saidasRec),
    },
    recorrentes: recorrentes ?? [],
  }
}

export async function PrevisaoContent() {
  const dados = await buscarPrevisao()

  if (!dados) {
    return <p className="text-red-600">Erro ao carregar previsão.</p>
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Voltar ao dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Previsão de Caixa</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Projeção do mês com base no que já aconteceu + contas recorrentes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Já entrou</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatarMoeda(dados.realizado.entradas)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Já saiu</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatarMoeda(dados.realizado.saidas)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Lucro realizado</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                dados.realizado.lucro >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(dados.realizado.lucro)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
            Projeção para o fim do mês
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-zinc-500">Entradas previstas</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatarMoeda(dados.projecao.entradas)}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                +{formatarMoeda(dados.previsto.entradas)} recorrentes
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Saídas previstas</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {formatarMoeda(dados.projecao.saidas)}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                +{formatarMoeda(dados.previsto.saidas)} recorrentes
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Lucro previsto</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  dados.projecao.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatarMoeda(dados.projecao.lucro)}
              </p>
            </div>
          </div>
        </div>

        {dados.recorrentes.length > 0 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-4">
              Contas recorrentes cadastradas
            </p>
            <ul className="divide-y divide-zinc-100">
              {dados.recorrentes.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{r.descricao}</p>
                    <p className="text-xs text-zinc-500">Todo dia {r.dia_do_mes}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      r.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {r.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(Number(r.valor))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {dados.recorrentes.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            💡 Cadastre suas contas recorrentes (aluguel, assinaturas, mensalidades)
            para que a previsão fique mais precisa.
          </div>
        )}
      </div>
    </div>
  )
}