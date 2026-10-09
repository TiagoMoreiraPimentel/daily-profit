'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Categoria = {
  id: string
  nome: string
  tipo: 'entrada' | 'saida'
  natureza: 'negocio' | 'pessoal'
}

export function ConfiguracoesContent() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  // Novo cadastro
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida')
  const [natureza, setNatureza] = useState<'negocio' | 'pessoal'>('negocio')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categorias')
      const data = await res.json()
      if (res.ok) setCategorias(data.categorias ?? [])
    } catch (e) {
      console.error(e)
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

    setErro(null)
    setSucesso(null)

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

    setErro(null)
    setSucesso(null)

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
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Voltar ao dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">⚙️ Configurações</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Personalize as categorias que aparecem no formulário de transação.
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
            ❌ {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded mb-4">
            ✅ {sucesso}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Nova categoria
            </h2>

            <form onSubmit={criar} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('entrada')}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
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
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      tipo === 'saida'
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    ↓ Saída
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Natureza</Label>
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

              <Button type="submit" className="w-full" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Criar categoria'}
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-zinc-200 p-6">
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
                <SecaoCategorias
                  titulo="💼 Entradas de negócio"
                  categorias={entradas}
                  onRenomear={renomear}
                  onExcluir={excluir}
                />
                <SecaoCategorias
                  titulo="💼 Saídas de negócio"
                  categorias={saidasNegocio}
                  onRenomear={renomear}
                  onExcluir={excluir}
                />
                <SecaoCategorias
                  titulo="🏠 Entradas pessoais"
                  categorias={entradasPessoal}
                  onRenomear={renomear}
                  onExcluir={excluir}
                />
                <SecaoCategorias
                  titulo="🏠 Saídas pessoais"
                  categorias={saidasPessoal}
                  onRenomear={renomear}
                  onExcluir={excluir}
                />
              </div>
            )}
          </div>
        </div>
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