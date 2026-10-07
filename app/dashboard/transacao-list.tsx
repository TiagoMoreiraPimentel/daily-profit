import { getTransacoesHoje } from '@/lib/queries'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export async function TransacaoList() {
  const transacoes = await getTransacoesHoje()

  if (transacoes.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        Nenhuma transação registrada hoje ainda.
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
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {t.descricao || (t.tipo === 'entrada' ? 'Entrada' : 'Saída')}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {t.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(Number(t.valor))}
                </span>
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
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-zinc-600">
                    {t.descricao || (t.tipo === 'entrada' ? 'Entrada' : 'Saída')}
                  </p>
                </div>
                <span className="text-sm text-zinc-500">
                  {t.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(Number(t.valor))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}