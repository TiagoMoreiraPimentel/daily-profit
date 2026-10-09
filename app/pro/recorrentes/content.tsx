'use client'

import { useRef } from 'react'
import { RecorrentesForm } from './form'
import { RecorrentesLista, type RecorrentesListaHandle } from './lista'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { AppFooter } from '@/components/app-footer'

export function RecorrentesContent({ tenantId }: { tenantId: string }) {
  const listaRef = useRef<RecorrentesListaHandle>(null)

  function handleSucesso() {
    listaRef.current?.recarregar()
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a
            href="/pro/previsao"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            ← Voltar à previsão
          </a>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">
          Contas Recorrentes
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Cadastre o que entra e sai todo mês no mesmo dia (aluguel, mensalidades,
          assinaturas). A previsão de caixa vai usar esses valores.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Cadastrar nova
            </h2>
            <RecorrentesForm tenantId={tenantId} onSucesso={handleSucesso} />
          </div>

          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Cadastradas
            </h2>
            <RecorrentesLista ref={listaRef} tenantId={tenantId} />
          </div>
        </div>

        <AppFooter />
      </div>

      <WhatsAppButton posicao="esquerda" tamanho="pequeno" />
    </div>
  )
}