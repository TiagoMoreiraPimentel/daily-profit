'use client'

import { useState, useEffect } from 'react'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'
import { Button } from '@/components/ui/button'

let mpInicializado = false

async function processarAssinatura(cardTokenId: string, payerEmail: string) {
  const planoRes = await fetch('/api/mercadopago/criar-plano', { method: 'POST' })
  const planoData = await planoRes.json()

  if (!planoRes.ok) {
    throw new Error(planoData.error || 'Erro ao criar plano')
  }

  const assinaturaRes = await fetch('/api/mercadopago/assinar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preapproval_plan_id: planoData.preapproval_plan_id,
      card_token_id: cardTokenId,
      payer_email: payerEmail,
    }),
  })
  const assinaturaData = await assinaturaRes.json()

  if (!assinaturaRes.ok) {
    throw new Error(assinaturaData.error || 'Erro ao criar assinatura')
  }

  return assinaturaData
}

export function ModalLimiteAtingido({ onFechar }: { onFechar: () => void }) {
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)
  const [sdkPronto, setSdkPronto] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (mpInicializado) {
      setSdkPronto(true)
      return
    }
    try {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, {
        locale: 'pt-BR',
      })
      mpInicializado = true
      setSdkPronto(true)
    } catch (e) {
      console.error('Erro ao inicializar Mercado Pago SDK:', e)
      setErro('Falha ao inicializar o SDK do Mercado Pago.')
    }
  }, [])

  async function handleSubmit({ formData }: { formData: any }) {
    console.log('Dados do Brick:', formData)
    setProcessando(true)
    setErro(null)

    try {
      const data = await processarAssinatura(
        formData.token,
        formData.payer?.email
      )

      console.log('Resposta da assinatura:', data)

      if (data.status === 'authorized' || data.status === 'pending') {
        setSucesso(true)

        try {
          await fetch('/api/mercadopago/sincronizar', { method: 'POST' })
        } catch (e) {
          console.error('Erro ao sincronizar:', e)
        }

        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setErro('Assinatura criada com status: ' + data.status)
      }
    } catch (e: any) {
      console.error('Erro ao processar:', e)
      setErro(e.message || 'Erro ao processar assinatura')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">
          Assinar Plano Pro — R$ 5,00/mês
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Preencha os dados do cartão para ativar sua assinatura.
        </p>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
            ❌ {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded mb-4">
            ✅ Assinatura criada com sucesso! Ativando seu plano...
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="block mt-2 text-green-800 underline text-xs"
            >
              Ir para o dashboard agora
            </button>
          </div>
        )}

        {processando ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500">Processando pagamento...</p>
          </div>
        ) : sucesso ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500">Redirecionando para o dashboard...</p>
          </div>
        ) : !sdkPronto ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500">Carregando SDK...</p>
          </div>
        ) : (
          <Payment
            initialization={{ amount: 5.0 }}
            customization={{
              paymentMethods: {
                creditCard: 'all',
                prepaidCard: 'all',
              },
            }}
            onReady={() => {
              console.log('Brick pronto')
            }}
            onError={(error) => {
              console.error('Erro no Brick (detalhado):', JSON.stringify(error))
              console.error('Erro no Brick (objeto):', error)
              setErro('Falha ao carregar o formulário. Veja o console (F12).')
            }}
            onSubmit={async (param) => {
              await handleSubmit(param)
            }}
          />
        )}

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onFechar}
            disabled={processando || sucesso}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function BannerLimite({
  transacoesMes,
  limite,
}: {
  transacoesMes: number
  limite: number
}) {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium text-amber-900">
            ⚠️ Você já usou {transacoesMes} de {limite} transações do plano Free
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Faltam {limite - transacoesMes} transações para atingir o limite.
          </p>
        </div>
        <Button size="sm" onClick={() => setMostrarModal(true)}>
          Assinar Pro — R$ 5,00/mês
        </Button>
      </div>

      {mostrarModal && (
        <ModalLimiteAtingido onFechar={() => setMostrarModal(false)} />
      )}
    </>
  )
}