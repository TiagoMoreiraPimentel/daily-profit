'use client'

import { useState } from 'react'
import { NovaTransacaoModal } from './nova-transacao-modal'

export function BotoesTransacao({ tenantId }: { tenantId: string }) {
  const [modal, setModal] = useState<'entrada' | 'saida' | null>(null)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setModal('entrada')}
          className="w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 hover:shadow-xl transition-all flex items-center justify-center text-2xl font-bold"
          title="Nova entrada"
          aria-label="Nova entrada"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setModal('saida')}
          className="w-14 h-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl transition-all flex items-center justify-center text-2xl font-bold"
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
          onFechar={() => setModal(null)}
        />
      )}
    </>
  )
}