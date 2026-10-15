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
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition"
        title="Dia anterior"
      >
        ←
      </button>

      <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-4 py-2.5 shadow-sm">
        <span className="text-sm font-semibold text-zinc-900">
          {formatarDataBR(dataAtual)}
        </span>
        {ehHoje(dataAtual) && (
          <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            Hoje
          </span>
        )}
      </div>

      <input
        type="date"
        value={dataAtual}
        max={hoje}
        onChange={(e) => navegar(e.target.value)}
        className="text-sm px-3 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 cursor-pointer transition"
        title="Escolher data"
      />

      <button
        type="button"
        onClick={() => navegar(adicionarDias(dataAtual, 1))}
        disabled={ehHoje(dataAtual)}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
        title="Próximo dia"
      >
        →
      </button>

      {!ehHoje(dataAtual) && (
        <button
          type="button"
          onClick={() => navegar(hoje)}
          className="text-xs font-medium px-3 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition"
        >
          Voltar para hoje
        </button>
      )}
    </div>
  )
}