'use client'

type DadoMes = {
  mes: string
  entradas: number
  saidas: number
  lucro: number
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatarMes(mes: string) {
  const [ano, mesNum] = mes.split('-')
  const data = new Date(parseInt(ano), parseInt(mesNum) - 1, 1)
  return data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

export function GraficoEvolucao({ dados }: { dados: DadoMes[] }) {
  if (dados.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-8">
        Nenhum dado disponível ainda.
      </p>
    )
  }

  // Encontra o maior valor absoluto (para escala)
  const maiorValor = Math.max(
    ...dados.map((d) => Math.max(d.entradas, d.saidas, Math.abs(d.lucro))),
    1
  )

  return (
    <div>
      {/* Legenda */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-zinc-600">Entradas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-zinc-600">Saídas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-zinc-900" />
          <span className="text-zinc-600">Lucro</span>
        </div>
      </div>

      {/* Área do gráfico */}
      <div className="flex items-end justify-between gap-2 h-64 border-b border-l border-zinc-200 pl-2 pb-0">
        {dados.map((d) => {
          const alturaEntradas = (d.entradas / maiorValor) * 100
          const alturaSaidas = (d.saidas / maiorValor) * 100
          const alturaLucro = (Math.abs(d.lucro) / maiorValor) * 100

          return (
            <div key={d.mes} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <div className="flex items-end gap-0.5 w-full justify-center h-full">
                {/* Entradas */}
                <div
                  className="w-3 bg-green-500 rounded-t"
                  style={{ height: `${alturaEntradas}%`, minHeight: '2px' }}
                  title={`Entradas: ${formatarMoeda(d.entradas)}`}
                />
                {/* Saídas */}
                <div
                  className="w-3 bg-red-500 rounded-t"
                  style={{ height: `${alturaSaidas}%`, minHeight: '2px' }}
                  title={`Saídas: ${formatarMoeda(d.saidas)}`}
                />
                {/* Lucro */}
                <div
                  className={`w-3 rounded-t ${
                    d.lucro >= 0 ? 'bg-zinc-900' : 'bg-orange-500'
                  }`}
                  style={{ height: `${alturaLucro}%`, minHeight: '2px' }}
                  title={`Lucro: ${formatarMoeda(d.lucro)}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Rótulos dos meses */}
      <div className="flex justify-between gap-2 mt-2 pl-2">
        {dados.map((d) => (
          <div key={d.mes} className="flex-1 text-center">
            <p className="text-xs text-zinc-500 capitalize">{formatarMes(d.mes)}</p>
          </div>
        ))}
      </div>

      {/* Valores do último mês */}
      <div className="mt-6 pt-4 border-t border-zinc-100">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
          Último mês
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Entradas</p>
            <p className="text-sm font-semibold text-green-600">
              {formatarMoeda(dados[dados.length - 1].entradas)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Saídas</p>
            <p className="text-sm font-semibold text-red-600">
              {formatarMoeda(dados[dados.length - 1].saidas)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Lucro</p>
            <p
              className={`text-sm font-semibold ${
                dados[dados.length - 1].lucro >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(dados[dados.length - 1].lucro)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}