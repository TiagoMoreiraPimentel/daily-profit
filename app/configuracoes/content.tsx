'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Categoria = {
  id: string
  nome: string
  tipo: 'entrada' | 'saida'
  natureza: 'negocio' | 'pessoal'
}

type Carteira = {
  id: string
  nome: string
  tipo: 'banco' | 'digital' | 'dinheiro' | 'outro'
  saldo_inicial: number
  cor: string | null
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

const TIPOS_CARTEIRA = [
  { value: 'banco', label: '🏦 Banco' },
  { value: 'digital', label: '📱 Conta digital' },
  { value: 'dinheiro', label: '💵 Dinheiro' },
  { value: 'outro', label: '📦 Outro' },
]

export function ConfiguracoesContent() {
  const [aba, setAba] = useState<'categorias' | 'carteiras'>('categorias')

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">⚙️ Configurações</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Personalize categorias e carteiras (bancos, contas digitais, dinheiro).
      </p>

      {/* Abas */}
      <div className="border-b border-zinc-200 mb-6 flex gap-1">
        <button
          onClick={() => setAba('categorias')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            aba === 'categorias'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          📋 Categorias
        </button>
        <button
          onClick={() => setAba('carteiras')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            aba === 'carteiras'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          💳 Carteiras
        </button>
      </div>

      {aba === 'categorias' ? <CategoriasPanel /> : <CarteirasPanel />}
    </div>
  )
}

// =====================================================
// PAINEL DE CATEGORIAS
// =====================================================
function CategoriasPanel() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida')
  const [natureza, setNatureza] = useState<'negocio' | 'pessoal'>('negocio')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categorias')
      const data = await res.json()
      if (res.ok) setCategorias(data.categorias ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setSucesso(null)

    if (!nome.trim()) {
      setErro('Digite um nome.')
      return
    }

    setSalvando(true)
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), tipo, natureza }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error || 'Erro ao criar categoria')
        return
      }
      setNome('')
      setSucesso('Categoria criada!')
      setTimeout(() => setSucesso(null), 2000)
      await carregar()
    } finally {
      setSalvando(false)
    }
  }

  async function renomear(id: string, nomeAtual: string) {
    const novoNome = prompt('Novo nome da categoria:', nomeAtual)
    if (!novoNome || novoNome.trim() === nomeAtual) return

    const res = await fetch(`/api/categorias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoNome.trim() }),
    })

    if (!res.ok) {
      const data = await res.json()
      setErro(data.error || 'Erro ao renomear')
      return
    }
    setSucesso('Categoria renomeada!')
    setTimeout(() => setSucesso(null), 2000)
    await carregar()
  }

  async function excluir(id: string, nomeCat: string) {
    if (!confirm(`Excluir a categoria "${nomeCat}"?`)) return
    const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setErro(data.error || 'Erro ao excluir')
      return
    }
    setSucesso('Categoria excluída!')
    setTimeout(() => setSucesso(null), 2000)
    await carregar()
  }

  const entradas = categorias.filter((c) => c.tipo === 'entrada' && c.natureza === 'negocio')
  const saidasNegocio = categorias.filter((c) => c.tipo === 'saida' && c.natureza === 'negocio')
  const entradasPessoal = categorias.filter((c) => c.tipo === 'entrada' && c.natureza === 'pessoal')
  const saidasPessoal = categorias.filter((c) => c.tipo === 'saida' && c.natureza === 'pessoal')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Nova categoria</h2>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
            ❌ {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg mb-4">
            ✅ {sucesso}
          </div>
        )}

        <form onSubmit={criar} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTipo('entrada')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
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
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  tipo === 'saida'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                ↓ Saída
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Natureza</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
              <button
                type="button"
                onClick={() => setNatureza('negocio')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
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
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  natureza === 'pessoal'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                🏠 Pessoal
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome da categoria</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Corte masculino"
              required
              disabled={salvando}
            />
          </div>

          <Button type="submit" variant="brand" className="w-full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Criar categoria'}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Suas categorias ({categorias.length})
        </h2>

        {loading ? (
          <p className="text-sm text-zinc-500 text-center py-4">Carregando...</p>
        ) : categorias.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            Nenhuma categoria cadastrada ainda.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <SecaoCategorias titulo="💼 Entradas de negócio" categorias={entradas} onRenomear={renomear} onExcluir={excluir} />
            <SecaoCategorias titulo="💼 Saídas de negócio" categorias={saidasNegocio} onRenomear={renomear} onExcluir={excluir} />
            <SecaoCategorias titulo="🏠 Entradas pessoais" categorias={entradasPessoal} onRenomear={renomear} onExcluir={excluir} />
            <SecaoCategorias titulo="🏠 Saídas pessoais" categorias={saidasPessoal} onRenomear={renomear} onExcluir={excluir} />
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================
// PAINEL DE CARTEIRAS
// =====================================================
function CarteirasPanel() {
  const [carteiras, setCarteiras] = useState<Carteira[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<'banco' | 'digital' | 'dinheiro' | 'outro'>('banco')
  const [saldoInicial, setSaldoInicial] = useState('')
  const [cor, setCor] = useState('#10b981')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/carteiras')
      const data = await res.json()
      if (res.ok) setCarteiras(data.carteiras ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setSucesso(null)

    if (!nome.trim()) {
      setErro('Digite um nome.')
      return
    }

    const saldoNum = parseFloat(saldoInicial.replace(',', '.')) || 0

    setSalvando(true)
    try {
      const res = await fetch('/api/carteiras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          tipo,
          saldo_inicial: saldoNum,
          cor,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error || 'Erro ao criar carteira')
        return
      }
      setNome('')
      setSaldoInicial('')
      setSucesso('Carteira criada!')
      setTimeout(() => setSucesso(null), 2000)
      await carregar()
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(id: string, nomeCart: string) {
    if (!confirm(`Excluir a carteira "${nomeCart}"?`)) return
    const res = await fetch(`/api/carteiras/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setErro(data.error || 'Erro ao excluir')
      return
    }
    setSucesso('Carteira excluída!')
    setTimeout(() => setSucesso(null), 2000)
    await carregar()
  }

  function iconeTipo(t: string) {
    if (t === 'banco') return '🏦'
    if (t === 'digital') return '📱'
    if (t === 'dinheiro') return '💵'
    return '📦'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Nova carteira</h2>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
            ❌ {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg mb-4">
            ✅ {sucesso}
          </div>
        )}

        <form onSubmit={criar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCarteira">Nome</Label>
            <Input
              id="nomeCarteira"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Itaú, Nubank, Dinheiro"
              required
              disabled={salvando}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_CARTEIRA.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTipo(t.value as any)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    tipo === t.value
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldoInicial">Saldo inicial (R$)</Label>
            <Input
              id="saldoInicial"
              inputMode="decimal"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              placeholder="0,00"
              disabled={salvando}
            />
            <p className="text-xs text-zinc-500">
              Quanto tem na conta agora (não é obrigatório — pode ser 0)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor">Cor (opcional)</Label>
            <input
              id="cor"
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 cursor-pointer"
            />
          </div>

          <Button type="submit" variant="brand" className="w-full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Criar carteira'}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Suas carteiras ({carteiras.length})
        </h2>

        {loading ? (
          <p className="text-sm text-zinc-500 text-center py-4">Carregando...</p>
        ) : carteiras.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            Nenhuma carteira cadastrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {carteiras.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: c.cor || '#e4e4e7' }}
                  >
                    {iconeTipo(c.tipo)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {c.nome}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Saldo inicial: {formatarMoeda(Number(c.saldo_inicial))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => excluir(c.id, c.nome)}
                  className="text-zinc-300 hover:text-red-600 transition-colors p-1 shrink-0"
                  title="Excluir carteira"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function SecaoCategorias({
  titulo,
  categorias,
  onRenomear,
  onExcluir,
}: {
  titulo: string
  categorias: Categoria[]
  onRenomear: (id: string, nome: string) => void
  onExcluir: (id: string, nome: string) => void
}) {
  if (categorias.length === 0) return null

  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{titulo}</p>
      <ul className="divide-y divide-zinc-100">
        {categorias.map((cat) => (
          <li key={cat.id} className="py-2 flex items-center justify-between gap-2">
            <span className="text-sm text-zinc-900 truncate">{cat.nome}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onRenomear(cat.id, cat.nome)}
                className="text-zinc-300 hover:text-blue-600 transition-colors p-1"
                title="Renomear"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => onExcluir(cat.id, cat.nome)}
                className="text-zinc-300 hover:text-red-600 transition-colors p-1"
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}