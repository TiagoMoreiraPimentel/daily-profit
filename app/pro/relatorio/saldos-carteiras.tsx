import { createClient } from '@/lib/supabase-server'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

async function buscarSaldos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const { data: carteiras } = await supabase
    .from('carteiras')
    .select('id, nome, tipo, saldo_inicial, cor')
    .eq('tenant_id', profile.tenant_id)
    .order('nome')

  if (!carteiras || carteiras.length === 0) return null

  const { data: transacoes } = await supabase
    .from('transactions')
    .select('carteira_id, tipo, valor')
    .not('carteira_id', 'is', null)

  const saldos = carteiras.map((c) => {
    const txs = transacoes?.filter((t) => t.carteira_id === c.id) ?? []
    const entradas = txs
      .filter((t) => t.tipo === 'entrada')
      .reduce((acc, t) => acc + Number(t.valor), 0)
    const saidas = txs
      .filter((t) => t.tipo === 'saida')
      .reduce((acc, t) => acc + Number(t.valor), 0)
    const saldoAtual = Number(c.saldo_inicial) + entradas - saidas

    return {
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      cor: c.cor,
      saldo_atual: saldoAtual,
    }
  })

  const total = saldos.reduce((acc, s) => acc + s.saldo_atual, 0)

  return { saldos, total }
}

function iconeTipo(tipo: string) {
  if (tipo === 'banco') return '🏦'
  if (tipo === 'digital') return '📱'
  if (tipo === 'dinheiro') return '💵'
  return '📦'
}

export async function SaldosCarteiras() {
  const dados = await buscarSaldos()
  if (!dados) return null

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-8">
      <div className="flex justify-between items-baseline mb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">
          💳 Saldos por carteira
        </p>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Total</p>
          <p className="text-xl font-bold text-zinc-900">
            {formatarMoeda(dados.total)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dados.saldos.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-3 rounded-md border border-zinc-100"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: s.cor || '#e4e4e7' }}
              >
                {iconeTipo(s.tipo)}
              </div>
              <p className="text-sm font-medium text-zinc-900 truncate">{s.nome}</p>
            </div>
            <p
              className={`text-sm font-bold whitespace-nowrap ${
                s.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(s.saldo_atual)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}