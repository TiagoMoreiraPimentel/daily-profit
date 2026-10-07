'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export function ExcluirTransacao({ id, descricao }: { id: string; descricao: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function excluir() {
    const confirmar = confirm(
      `Excluir esta transação${descricao ? ` "${descricao}"` : ''}?`
    )
    if (!confirmar) return

    setLoading(true)
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir. Tente novamente.')
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={excluir}
      disabled={loading}
      className="text-zinc-300 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
      title="Excluir transação"
    >
      {loading ? '...' : '🗑️'}
    </button>
  )
}