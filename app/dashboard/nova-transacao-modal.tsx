'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  descricao: string | null
  natureza: 'negocio' | 'pessoal'
  categoria: string | null
  carteira_id: string | null
}

type Carteira = {
  id: string
  nome: string
  tipo: string
  cor: string | null
}

function formatarDataBR(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

function ehHoje(dataISO: string) {
  const hoje = new Date().toISOString().split('T')[0]
  return dataISO === hoje
}

export function NovaTransacaoModal({
  tenantId,
  tipoInicial,
  dataSelecionada,
  transacaoExistente,
  onFechar,
}: {
  tenantId: string
  tipoInicial: 'entrada' | 'saida'
  dataSelecionada: string
  transacaoExistente?: Transacao
  onFechar: () => void
}) {
  const router = useRouter()
  const supabase = createClient()

  const modoEdicao = !!transacaoExistente

  const [tipo, setTipo] = useState<'entrada' | 'saida'>(
    transacaoExistente?.tipo ?? tipoInicial
  )
  const [valor, setValor] = useState(
    transacaoExistente ? String(transacaoExistente.valor).replace('.', ',') : ''
  )
  const [descricao, setDescricao] = useState(transacaoExistente?.descricao ?? '')
  const [natureza, setNatureza] = useState<'negocio' | 'pessoal'>(
    transacaoExistente?.natureza ?? 'negocio'
  )
  const [categoria, setCategoria] = useState(transacaoExistente?.categoria ?? '')
  const [carteiraId, setCarteiraId] = useState(transacaoExistente?.carteira_id ?? '')
  const [categorias, setCategorias] = useState<
    { id: number; nome: string; tipo: string; natureza_sugerida: string }[]
  >([])
  const [carteiras, setCarteiras] = useState<Carteira[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const res = await fetch(`/api/categorias?tipo=${tipo}&natureza=${natureza}`)
        const data = await res.json()
        if (res.ok) setCategorias(data.categorias ?? [])
      } catch (e) {
        console.error('Erro ao carregar categorias:', e)
      }
    }
    carregarCategorias()
  }, [tipo, natureza])

  useEffect(() => {
    async function carregarCarteiras() {
      try {
        const res = await fetch('/api/carteiras')
        const data = await res.json()
        if (res.ok) setCarteiras(data.carteiras ?? [])
      } catch (e) {
        console.error('Erro ao carregar carteiras:', e)
      }
    }
    carregarCarteiras()
  }, [])

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

    if (modoEdicao && transacaoExistente) {
      try {
        const res = await fetch('/api/transactions/editar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: transacaoExistente.id,
            tipo,
            valor: valorNumerico,
            descricao,
            natureza,
            categoria: categoria || null,
            carteira_id: carteiraId || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setErro(data.error || 'Erro ao salvar. Tente novamente.')
          setLoading(false)
          return
        }
      } catch (e) {
        setErro('Erro de conexão. Tente novamente.')
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('transactions').insert({
        tenant_id: tenantId,
        tipo,
        valor: valorNumerico,
        descricao: descricao.trim() || null,
        natureza,
        categoria: categoria || null,
        carteira_id: carteiraId || null,
        data: dataSelecionada,
      })

      if (error) {
        console.error('Erro ao inserir transação:', error)
        setErro('Erro ao salvar. Tente novamente.')
        setLoading(false)
        return
      }
    }

    router.refresh()
    onFechar()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => !loading && onFechar()}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              {modoEdicao
                ? 'Editar transação'
                : tipo === 'entrada'
                ? 'Nova entrada'
                : 'Nova saída'}
            </h2>
            {!modoEdicao && (
              <p className="text-xs text-zinc-500 mt-1">
                Será registrada em{' '}
                <strong className="text-zinc-700">
                  {ehHoje(dataSelecionada) ? 'hoje' : formatarDataBR(dataSelecionada)}
                </strong>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={loading}
            className="text-zinc-400 hover:text-zinc-900 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition"
            title="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TIPO */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                tipo === 'entrada'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              ↑ Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo('saida')}
              className={`py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                tipo === 'saida'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              ↓ Saída
            </button>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              ❌ {erro}
            </div>
          )}

          {/* VALOR */}
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
              className="text-lg font-semibold h-14"
            />
          </div>

          {/* DESCRIÇÃO */}
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

          {/* NATUREZA */}
          <div className="space-y-2">
            <Label>Isso é do negócio ou pessoal?</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
              <button
                type="button"
                onClick={() => setNatureza('negocio')}
                className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                  natureza === 'negocio'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                💼 Negócio
              </button>
              <button
                type="button"
                onClick={() => setNatureza('pessoal')}
                className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                  natureza === 'pessoal'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                🏠 Pessoal
              </button>
            </div>
          </div>

          {/* CATEGORIA */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria (opcional)</Label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={loading}
              className="flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Sem categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nome}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* CARTEIRA */}
          {carteiras.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="carteira">Carteira (opcional)</Label>
              <select
                id="carteira"
                value={carteiraId}
                onChange={(e) => setCarteiraId(e.target.value)}
                disabled={loading}
                className="flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Sem carteira</option>
                {carteiras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* BOTÕES */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onFechar}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={tipo === 'entrada' ? 'brand' : 'danger'}
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Salvando...' : modoEdicao ? 'Salvar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}