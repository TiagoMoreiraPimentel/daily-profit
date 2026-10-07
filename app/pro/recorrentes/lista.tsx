'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'

type Recorrente = {
  id: string
  descricao: string
  valor: number
  tipo: 'entrada' | 'saida'
  dia_do_mes: number
  ativo: boolean
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function RecorrentesLista({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [recorrentes, setRecorrentes] = useState<Recorrente[]>([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('recurring')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('criado_em', { ascending: false })

    if (!error) setRecorrentes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [tenantId])

  async function remover(id: string) {
    if (!confirm('Remover esta conta recorrente?')) return
    await supabase.from('recurring').delete().eq('id', id)
    carregar()
    router.refresh()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await supabase.from('recurring').update({ ativo: !ativo }).eq('id', id)
    carregar()
    router.refresh()
  }

  if (loading) {
    return <p className="text-sm text-zinc-500 text-center py-4">Carregando...</p>
  }

  if (recorrentes.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-4">
        Nenhuma conta recorrente cadastrada ainda.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {recorrentes.map((r) => (
        <li key={r.id} className="py-3 flex items-center justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900">
              {r.descricao}
              {!r.ativo && (
                <span className="ml-2 text-xs text-zinc-400">(inativa)</span>
              )}
            </p>
            <p className="text-xs text-zinc-500">
              Todo dia {r.dia_do_mes} ·{' '}
              <span
                className={
                  r.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                }
              >
                {r.tipo === 'entrada' ? '+' : '−'} {formatarMoeda(Number(r.valor))}
              </span>
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAtivo(r.id, r.ativo)}
              title={r.ativo ? 'Desativar' : 'Ativar'}
            >
              {r.ativo ? '⏸️' : '▶️'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remover(r.id)}
              title="Remover"
            >
              🗑️
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}