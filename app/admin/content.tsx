'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tenant = {
  id: string
  nome_negocio: string
  tipo: string
  plano: string
  criado_em: string
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
  const data = new Date(dataISO)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

function corDoPlano(plano: string) {
  if (plano === 'super') return 'bg-purple-100 text-purple-700'
  if (plano === 'pro') return 'bg-green-100 text-green-700'
  return 'bg-zinc-100 text-zinc-600'
}

function corDoStatus(status: string | null) {
  if (!status) return 'bg-zinc-100 text-zinc-500'
  if (status === 'authorized') return 'bg-green-100 text-green-700'
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

  async function excluirTenant(tenantId: string, nome: string) {
    if (!confirm(`⚠️ Excluir o tenant "${nome}"?`)) return
    if (!confirm('⚠️ Isso apagará TODOS os dados (transações, usuários, assinaturas). Continuar?')) return
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
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Voltar ao dashboard
          </Link>
        </div>

        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">🔧 Painel Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Logado como <strong>{admin.email}</strong>
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs text-zinc-500">Total</p>
              <p className="text-2xl font-bold text-zinc-900">{tenants.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Pro</p>
              <p className="text-2xl font-bold text-green-600">{totalPro}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Free</p>
              <p className="text-2xl font-bold text-zinc-500">{totalFree}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nome do negócio ou e-mail..."
            className="w-full max-w-md px-4 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700">Negócio</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700">Dono</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700">Plano</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700">Últ. pgto</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700">Próx. venc.</th>
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
                  filtrados.map((t) => (
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
                      <td className="px-4 py-3 text-zinc-700 text-xs whitespace-nowrap">
                        {formatarData(t.assinatura?.proxima_cobranca ?? null)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{t.totalTransacoes}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <select
                            value={t.plano}
                            onChange={(e) => mudarPlano(t.id, e.target.value)}
                            disabled={loading === t.id}
                            className="text-xs px-2 py-1 rounded border border-zinc-300 bg-white text-zinc-900 cursor-pointer"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}