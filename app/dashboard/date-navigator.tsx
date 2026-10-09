'use client'

import { useRouter, useSearchParams } from 'next/navigation'

function formatarDataBR(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

function ehHoje(dataISO: string) {
  const hoje = new Date().toISOString().split('T')[0]
  return dataISO === hoje
}

function adicionarDias(dataISO: string, dias: number) {
  const data = new Date(dataISO + 'T12:00:00')
  data.setDate(data.getDate() + dias)
  return data.toISOString().split('T')[0]
}

export function DateNavigator() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const hoje = new Date().toISOString().split('T')[0]
  const dataAtual = searchParams.get('data') || hoje

  function navegar(novaData: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (novaData === hoje) {
      params.delete('data')
    } else {
      params.set('data', novaData)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => navegar(adicionarDias(dataAtual, -1))}
        className="w-9 h-9 flex items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 transition"
        title="Dia anterior"
      >
        ◀
      </button>

      <div className="flex items-center gap-2 bg-white border border-zinc-300 rounded-md px-3 py-2">
        <span className="text-sm font-medium text-zinc-900">
          {formatarDataBR(dataAtual)}
        </span>
        {ehHoje(dataAtual) && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Hoje
          </span>
        )}
      </div>

      <input
        type="date"
        value={dataAtual}
        max={hoje}
        onChange={(e) => navegar(e.target.value)}
        className="text-sm px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 cursor-pointer"
        title="Escolher data"
      />

      <button
        type="button"
        onClick={() => navegar(adicionarDias(dataAtual, 1))}
        disabled={ehHoje(dataAtual)}
        className="w-9 h-9 flex items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        title="Próximo dia"
      >
        ▶
      </button>

      {!ehHoje(dataAtual) && (
        <button
          type="button"
          onClick={() => navegar(hoje)}
          className="text-xs px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 transition"
        >
          Voltar para hoje
        </button>
      )}
    </div>
  )
}