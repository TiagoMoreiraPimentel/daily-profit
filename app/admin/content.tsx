'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Tenant = {
  id: string
  nome_negocio: string
  tipo: string
  plano: string
  criado_em: string
  plano_vencimento: string | null
  dono: { nome: string; email: string }
  totalTransacoes: number
  assinatura: {
    status: string
    proxima_cobranca: string | null
    ultimo_pagamento: string | null
  } | null
}

function formatarData(dataISO: string | null) {
  if (!dataISO) return '—'
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

function corDoPlano(plano: string) {
  if (plano === 'super') return 'bg-violet-100 text-violet-700'
  if (plano === 'pro') return 'bg-emerald-100 text-emerald-700'
  return 'bg-zinc-100 text-zinc-600'
}

function corDoStatus(status: string | null) {
  if (!status) return 'bg-zinc-100 text-zinc-500'
  if (status === 'authorized') return 'bg-emerald-100 text-emerald-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'paused') return 'bg-orange-100 text-orange-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-zinc-100 text-zinc-500'
}

function rotuloDoStatus(status: string | null) {
  if (!status) return '—'
  const mapa: Record<string, string> = {
    authorized: '✅ Ativa',
    pending: '⏳ Pendente',
    paused: '⏸️ Pausada',
    cancelled: '❌ Cancelada',
  }
  return mapa[status] ?? status
}

function situacaoVencimento(vencimento: string | null, plano: string) {
  if (plano === 'super') {
    return { label: '∞', cor: 'text-violet-700', dias: null }
  }
  if (plano !== 'pro' || !vencimento) {
    return { label: '—', cor: 'text-zinc-400', dias: null }
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const [ano, mes, dia] = vencimento.split('-').map(Number)
  const dataVenc = new Date(ano, mes - 1, dia)
  dataVenc.setHours(0, 0, 0, 0)

  const diffMs = dataVenc.getTime() - hoje.getTime()
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (dias < 0) {
    return { label: `Vencido (${Math.abs(dias)}d)`, cor: 'text-red-600 font-semibold', dias }
  }
  if (dias === 0) {
    return { label: 'Vence hoje', cor: 'text-red-600 font-semibold', dias }
  }
  if (dias <= 3) {
    return { label: `Vence em ${dias}d`, cor: 'text-amber-600 font-semibold', dias }
  }
  return { label: `Em ${dias}d`, cor: 'text-zinc-600', dias }
}

export function AdminContent({
  admin,
  tenants,
}: {
  admin: { nome: string | null; email: string | undefined }
  tenants: Tenant[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')
  const [editandoVencimento, setEditandoVencimento] = useState<string | null>(null)
  const [dataInput, setDataInput] = useState('')

  async function mudarPlano(tenantId: string, novoPlano: string) {
    if (!confirm(`Mudar o plano deste tenant para "${novoPlano}"?`)) return
    setLoading(tenantId)
    try {
      const res = await fetch('/api/admin/mudar-plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, novoPlano }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao mudar plano')
      } else {
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  async function definirVencimento(tenantId: string) {
    if (!dataInput) {
      alert('Escolha uma data de início')
      return
    }
    setLoading(tenantId)
    try {
      const res = await fetch('/api/admin/definir-vencimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, dataInicio: dataInput }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao definir vencimento')
      } else {
        const data = await res.json()
        alert(`✅ Vencimento definido para ${formatarData(data.plano_vencimento)}`)
        setEditandoVencimento(null)
        setDataInput('')
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  async function excluirTenant(tenantId: string, nome: string) {
    if (!confirm(`⚠️ Excluir o tenant "${nome}"?`)) return
    if (!confirm('⚠️ Isso apagará TODOS os dados. Continuar?')) return
    setLoading(tenantId)
    try {
      const res = await fetch('/api/admin/excluir-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir')
      } else {
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  const filtrados = tenants.filter((t) => {
    const termo = filtro.toLowerCase()
    return (
      t.nome_negocio?.toLowerCase().includes(termo) ||
      t.dono.email?.toLowerCase().includes(termo)
    )
  })

  const totalPro = tenants.filter((t) => t.plano === 'pro').length
  const totalFree = tenants.filter((t) => t.plano === 'free').length

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            🔧 Painel Admin
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Logado como <strong>{admin.email}</strong>
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs text-zinc-500">Total</p>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">
              {tenants.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Pro</p>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">
              {totalPro}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Free</p>
            <p className="text-2xl font-bold text-zinc-500 tracking-tight">
              {totalFree}
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nome do negócio ou e-mail..."
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">Negócio</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">Dono</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">Plano</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">Vencimento</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">Últ. pgto</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-700">Trans.</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-zinc-500">
                    Nenhum tenant encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map((t) => {
                  const sit = situacaoVencimento(t.plano_vencimento, t.plano)
                  const estaEditando = editandoVencimento === t.id

                  return (
                    <tr key={t.id} className={loading === t.id ? 'opacity-50' : ''}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{t.nome_negocio}</p>
                        <p className="text-xs text-zinc-500">{t.tipo}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-900">{t.dono.nome || '—'}</p>
                        <p className="text-xs text-zinc-500">{t.dono.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${corDoPlano(t.plano)}`}
                        >
                          {t.plano === 'super' ? '⭐ Super' : t.plano === 'pro' ? 'Pro' : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {estaEditando ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={dataInput}
                              onChange={(e) => setDataInput(e.target.value)}
                              className="text-xs px-2 py-1 rounded-lg border border-zinc-300 bg-white text-zinc-900"
                            />
                            <button
                              onClick={() => definirVencimento(t.id)}
                              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
                              title="Salvar"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditandoVencimento(null)
                                setDataInput('')
                              }}
                              className="text-xs text-zinc-400 hover:text-zinc-900"
                              title="Cancelar"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-zinc-700">
                                {formatarData(t.plano_vencimento)}
                              </p>
                              <p className={`text-xs ${sit.cor}`}>{sit.label}</p>
                            </div>
                            {t.plano !== 'super' && (
                              <button
                                onClick={() => {
                                  setEditandoVencimento(t.id)
                                  setDataInput(
                                    t.plano_vencimento ||
                                      new Date().toISOString().split('T')[0]
                                  )
                                }}
                                className="text-zinc-300 hover:text-blue-600 transition-colors"
                                title="Definir/alterar vencimento"
                              >
                                ✏️
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${corDoStatus(
                            t.assinatura?.status ?? null
                          )}`}
                        >
                          {rotuloDoStatus(t.assinatura?.status ?? null)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-700 text-xs whitespace-nowrap">
                        {formatarData(t.assinatura?.ultimo_pagamento ?? null)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{t.totalTransacoes}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <select
                            value={t.plano}
                            onChange={(e) => mudarPlano(t.id, e.target.value)}
                            disabled={loading === t.id}
                            className="text-xs px-2 py-1 rounded-lg border border-zinc-300 bg-white text-zinc-900 cursor-pointer"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="super">Super</option>
                          </select>
                          <button
                            onClick={() => excluirTenant(t.id, t.nome_negocio)}
                            disabled={loading === t.id}
                            className="text-zinc-300 hover:text-red-600 transition-colors p-1"
                            title="Excluir tenant"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-xs text-zinc-500">
        💡 Clique no ✏️ ao lado do vencimento para definir/alterar. O vencimento é
        calculado como <strong>1 mês após a data de início</strong> escolhida.
        Quando vencer, o plano volta para <strong>Free</strong> automaticamente.
      </div>
    </div>
  )
}