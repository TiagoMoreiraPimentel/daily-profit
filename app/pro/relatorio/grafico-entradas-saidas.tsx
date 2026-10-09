'use client'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function GraficoEntradasSaidas({
  entradas,
  saidas,
}: {
  entradas: number
  saidas: number
}) {
  const total = entradas + saidas

  if (total === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-8">
        Nenhuma movimentação registrada neste mês.
      </p>
    )
  }

  const percentualEntradas = (entradas / total) * 100
  const percentualSaidas = (saidas / total) * 100

  // Calcula os arcos do donut (circunferência = 2 * π * raio)
  // Usamos raio = 70, então circunferência = 439.82
  const raio = 70
  const circunferencia = 2 * Math.PI * raio
  const arcoEntradas = (percentualEntradas / 100) * circunferencia
  const arcoSaidas = (percentualSaidas / 100) * circunferencia

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      {/* Donut */}
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Círculo de fundo */}
          <circle
            cx="90"
            cy="90"
            r={raio}
            fill="none"
            stroke="#f4f4f5"
            strokeWidth="20"
          />

          {/* Arco de saídas (vermelho) — começa de 0 */}
          <circle
            cx="90"
            cy="90"
            r={raio}
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeDasharray={`${arcoSaidas} ${circunferencia}`}
            strokeDashoffset="0"
            transform="rotate(-90 90 90)"
          />

          {/* Arco de entradas (verde) — começa depois das saídas */}
          <circle
            cx="90"
            cy="90"
            r={raio}
            fill="none"
            stroke="#22c55e"
            strokeWidth="20"
            strokeDasharray={`${arcoEntradas} ${circunferencia}`}
            strokeDashoffset={`-${arcoSaidas}`}
            transform="rotate(-90 90 90)"
          />
        </svg>

        {/* Total no centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total</p>
          <p className="text-lg font-bold text-zinc-900">
            {formatarMoeda(total)}
          </p>
        </div>
      </div>

      {/* Legenda */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-green-500 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Entradas
            </p>
            <p className="text-lg font-bold text-green-600">
              {formatarMoeda(entradas)}
            </p>
            <p className="text-xs text-zinc-400">
              {percentualEntradas.toFixed(1)}% do total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Saídas
            </p>
            <p className="text-lg font-bold text-red-600">
              {formatarMoeda(saidas)}
            </p>
            <p className="text-xs text-zinc-400">
              {percentualSaidas.toFixed(1)}% do total
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">
            Saldo
          </p>
          <p
            className={`text-lg font-bold ${
              entradas - saidas >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatarMoeda(entradas - saidas)}
          </p>
        </div>
      </div>
    </div>
  )
}