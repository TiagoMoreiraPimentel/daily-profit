import { getTransacoesPorData } from '@/lib/queries'
import { createClient } from '@/lib/supabase-server'
import { AcoesTransacao } from './acoes-transacao'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarHora(dataISO: string) {
  const data = new Date(dataISO)
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export async function TransacaoList({
  data,
  tenantId,
}: {
  data: string
  tenantId: string
}) {
  const transacoes = await getTransacoesPorData(data)

  const supabase = await createClient()
  const { data: carteiras } = await supabase
    .from('carteiras')
    .select('id, nome')

  const nomePorCarteira: Record<string, string> = {}
  carteiras?.forEach((c) => {
    nomePorCarteira[c.id] = c.nome
  })

  if (transacoes.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm">
        <p className="text-4xl mb-3">📭</p>
        <p>Nenhuma transação registrada neste dia.</p>
      </div>
    )
  }

  const negocio = transacoes.filter((t) => t.natureza === 'negocio')
  const pessoal = transacoes.filter((t) => t.natureza === 'pessoal')

  return (
    <div className="space-y-6">
      {negocio.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            💼 Negócio ({negocio.length})
          </p>
          <ul className="divide-y divide-zinc-100">
            {negocio.map((t) => (
              <li
                key={t.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors -mx-2 px-2 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {t.descricao || (t.tipo === 'entrada' ? 'Entrada' : 'Saída')}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {formatarHora(t.criado_em)}
                    {t.categoria && ` · ${t.categoria}`}
                    {t.carteira_id && nomePorCarteira[t.carteira_id] && (
                      <> · 💳 {nomePorCarteira[t.carteira_id]}</>
                    )}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${
                    t.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {t.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(Number(t.valor))}
                </span>
                <AcoesTransacao
                  tenantId={tenantId}
                  transacao={{
                    id: t.id,
                    tipo: t.tipo,
                    valor: Number(t.valor),
                    descricao: t.descricao,
                    natureza: t.natureza,
                    categoria: t.categoria,
                    carteira_id: t.carteira_id,
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {pessoal.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            🏠 Pessoal ({pessoal.length})
          </p>
          <ul className="divide-y divide-zinc-100">
            {pessoal.map((t) => (
              <li
                key={t.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors -mx-2 px-2 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 truncate">
                    {t.descricao || (t.tipo === 'entrada' ? 'Entrada' : 'Saída')}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {formatarHora(t.criado_em)}
                    {t.categoria && ` · ${t.categoria}`}
                    {t.carteira_id && nomePorCarteira[t.carteira_id] && (
                      <> · 💳 {nomePorCarteira[t.carteira_id]}</>
                    )}
                  </p>
                </div>
                <span className="text-sm text-zinc-500 whitespace-nowrap">
                  {t.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(Number(t.valor))}
                </span>
                <AcoesTransacao
                  tenantId={tenantId}
                  transacao={{
                    id: t.id,
                    tipo: t.tipo,
                    valor: Number(t.valor),
                    descricao: t.descricao,
                    natureza: t.natureza,
                    categoria: t.categoria,
                    carteira_id: t.carteira_id,
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}