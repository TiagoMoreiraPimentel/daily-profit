'use client'

import { useState } from 'react'
import { NovaTransacaoModal } from './nova-transacao-modal'

export function BotoesTransacao({
  tenantId,
  dataSelecionada,
}: {
  tenantId: string
  dataSelecionada: string
}) {
  const [modal, setModal] = useState<'entrada' | 'saida' | null>(null)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setModal('entrada')}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/40 transition-all flex items-center justify-center text-2xl font-bold active:scale-95"
          title="Nova entrada"
          aria-label="Nova entrada"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setModal('saida')}
          className="w-14 h-14 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/40 transition-all flex items-center justify-center text-2xl font-bold active:scale-95"
          title="Nova saída"
          aria-label="Nova saída"
        >
          −
        </button>
      </div>

      {modal && (
        <NovaTransacaoModal
          tenantId={tenantId}
          tipoInicial={modal}
          dataSelecionada={dataSelecionada}
          onFechar={() => setModal(null)}
        />
      )}
    </>
  )
}