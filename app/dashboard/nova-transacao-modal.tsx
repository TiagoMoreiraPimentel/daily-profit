'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function NovaTransacaoModal({
  tenantId,
  tipoInicial,
  onFechar,
}: {
  tenantId: string
  tipoInicial: 'entrada' | 'saida'
  onFechar: () => void
}) {
  const router = useRouter()
  const supabase = createClient()

  const [tipo, setTipo] = useState<'entrada' | 'saida'>(tipoInicial)
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [natureza, setNatureza] = useState<'negocio' | 'pessoal'>('negocio')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Fecha com ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onFechar()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [loading, onFechar])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    const valorNumerico = parseFloat(valor.replace(',', '.'))

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Digite um valor válido maior que zero.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('transactions').insert({
      tenant_id: tenantId,
      tipo,
      valor: valorNumerico,
      descricao: descricao.trim() || null,
      natureza,
    })

    if (error) {
      console.error('Erro ao inserir transação:', error)
      setErro('Erro ao salvar. Tente novamente.')
      setLoading(false)
      return
    }

    router.refresh()
    onFechar()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => !loading && onFechar()}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-900">
            {tipo === 'entrada' ? '↑ Nova entrada' : '↓ Nova saída'}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            disabled={loading}
            className="text-zinc-400 hover:text-zinc-900 text-2xl leading-none"
            title="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`py-3 px-4 rounded-md font-medium transition-colors ${
                tipo === 'entrada'
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              ↑ Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo('saida')}
              className={`py-3 px-4 rounded-md font-medium transition-colors ${
                tipo === 'saida'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              ↓ Saída
            </button>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
              ❌ {erro}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Corte de cabelo"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Isso é do negócio ou pessoal?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNatureza('negocio')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  natureza === 'negocio'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                💼 Negócio
              </button>
              <button
                type="button"
                onClick={() => setNatureza('pessoal')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  natureza === 'pessoal'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                🏠 Pessoal
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              O que for marcado como &quot;pessoal&quot; não entra no cálculo de lucro.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50"
              onClick={onFechar}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}