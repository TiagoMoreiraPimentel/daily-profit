'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RecorrentesForm({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [diaDoMes, setDiaDoMes] = useState('5')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

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

    const dia = parseInt(diaDoMes)
    if (isNaN(dia) || dia < 1 || dia > 31) {
      setErro('O dia do mês deve ser entre 1 e 31.')
      setLoading(false)
      return
    }

    if (!descricao.trim()) {
      setErro('Digite uma descrição.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('recurring').insert({
      tenant_id: tenantId,
      tipo,
      descricao: descricao.trim(),
      valor: valorNumerico,
      dia_do_mes: dia,
      ativo: true,
    })

    if (error) {
      console.error('Erro ao cadastrar recorrente:', error)
      setErro('Erro ao salvar. Tente novamente.')
      setLoading(false)
      return
    }

    setDescricao('')
    setValor('')
    setDiaDoMes('5')
    setSucesso(true)
    setLoading(false)

    router.refresh()
    setTimeout(() => setSucesso(false), 2000)
  }

  return (
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
          ↑ Entrada fixa
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
          ↓ Saída fixa
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
          ❌ {erro}
        </div>
      )}

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
          ✅ Conta recorrente cadastrada!
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Aluguel da loja"
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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
          <Label htmlFor="dia">Dia do mês</Label>
          <Input
            id="dia"
            type="number"
            min={1}
            max={31}
            value={diaDoMes}
            onChange={(e) => setDiaDoMes(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Cadastrar recorrente'}
      </Button>
    </form>
  )
}