'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalLimiteAtingido } from './paywall'

export function TransacaoForm({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [natureza, setNatureza] = useState<'negocio' | 'pessoal'>('negocio')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [mostrarModalLimite, setMostrarModalLimite] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro(null)
    setSucesso(false)

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
      if (
        error.message.includes('row-level security') ||
        error.message.includes('violates row-level security policy')
      ) {
        setMostrarModalLimite(true)
        setLoading(false)
        return
      }

      console.error('Erro ao inserir transação:', error)
      setErro(`Erro ao salvar: ${error.message}`)
      setLoading(false)
      return
    }

    setValor('')
    setDescricao('')
    setNatureza('negocio')
    setSucesso(true)
    setLoading(false)

    router.refresh()
    setTimeout(() => setSucesso(false), 2000)
  }

  return (
    <>
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

        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
            ✅ Transação registrada!
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Salvando...' : 'Registrar'}
        </Button>
      </form>

      {mostrarModalLimite && (
        <ModalLimiteAtingido onFechar={() => setMostrarModalLimite(false)} />
      )}
    </>
  )
}