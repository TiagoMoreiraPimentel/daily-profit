import { getTransacoesPorData } from '@/lib/queries'
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

  if (transacoes.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        Nenhuma transação registrada neste dia.
      </div>
    )
  }

  const negocio = transacoes.filter((t) => t.natureza === 'negocio')
  const pessoal = transacoes.filter((t) => t.natureza === 'pessoal')

  return (
    <div className="space-y-6">
      {negocio.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
            💼 Negócio ({negocio.length})
          </p>
          <ul className="divide-y divide-zinc-100">
            {negocio.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {t.descricao || (t.tipo === 'entrada' ? 'Entrada' : 'Saída')}
                  </p>
                  <p className="text-xs text-zinc-400">{formatarHora(t.criado_em)}</p>
                </div>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${
                    t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
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
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {pessoal.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
            🏠 Pessoal ({pessoal.length}) — não afeta o lucro
          </p>
          <ul className="divide-y divide-zinc-100">
            {pessoal.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-600 truncate">
                    {t.descricao || (t.tipo === 'entrada' ? 'Entrada' : 'Saída')}
                  </p>
                  <p className="text-xs text-zinc-400">{formatarHora(t.criado_em)}</p>
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