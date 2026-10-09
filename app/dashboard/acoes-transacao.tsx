'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { NovaTransacaoModal } from './nova-transacao-modal'

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  descricao: string | null
  natureza: 'negocio' | 'pessoal'
  categoria: string | null
}

export function AcoesTransacao({
  transacao,
  tenantId,
}: {
  transacao: Transacao
  tenantId: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [editando, setEditando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  async function excluir() {
    const confirmar = confirm(
      `Excluir esta transação${transacao.descricao ? ` "${transacao.descricao}"` : ''}?`
    )
    if (!confirmar) return

    setExcluindo(true)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transacao.id)

    if (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir. Tente novamente.')
      setExcluindo(false)
      return
    }

    router.refresh()
    setExcluindo(false)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditando(true)}
          disabled={excluindo}
          className="text-zinc-300 hover:text-blue-600 transition-colors p-1 disabled:opacity-50"
          title="Editar transação"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={excluir}
          disabled={excluindo}
          className="text-zinc-300 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
          title="Excluir transação"
        >
          {excluindo ? '...' : '🗑️'}
        </button>
      </div>

      {editando && (
        <NovaTransacaoModal
          tenantId={tenantId}
          tipoInicial={transacao.tipo}
          dataSelecionada={new Date().toISOString().split('T')[0]}
          transacaoExistente={transacao}
          onFechar={() => setEditando(false)}
        />
      )}
    </>
  )
}