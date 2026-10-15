'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * ⚠️ ATENÇÃO: O código de integração com o Mercado Pago (Payment Brick)
 * está mantido abaixo, mas COMENTADO, porque o antifraude do MP está
 * bloqueando as assinaturas em produção (erro CC_VAL_433).
 *
 * Para reativar no futuro:
 * 1. Descomentar os imports e o código abaixo
 * 2. Restaurar o `paywall.tsx` original no dashboard
 * 3. Testar em uma conta/cartão novo após o bloqueio expirar
 */

/*
import { useEffect } from 'react'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'

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
  // ... código original mantido aqui
}
*/

const WHATSAPP_NUMERO = '5511992233306'
const WHATSAPP_MENSAGEM = encodeURIComponent(
  'Olá! Quero assinar o plano Pro do Daily Profit. Pode me enviar o link de pagamento?'
)

export function BannerLimite({
  transacoesMes,
  limite,
}: {
  transacoesMes: number
  limite: number
}) {
  const href = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAGEM}`

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="text-sm font-medium text-amber-900">
          ⚠️ Você já usou {transacoesMes} de {limite} transações do plano Free
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Faltam {limite - transacoesMes} transações para atingir o limite.
          Assine o Pro para ilimitado.
        </p>
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
          ⭐ Assinar Pro
        </Button>
      </a>
    </div>
  )
}

/**
 * Modal de limite atingido — versão atual (WhatsApp).
 * A versão com Payment Brick está comentada acima.
 */
export function ModalLimiteAtingido({ onFechar }: { onFechar: () => void }) {
  const href = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAGEM}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">
          Limite do plano Free atingido
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Você já registrou as 30 transações do plano Free neste mês. Para continuar
          registrando sem limites, assine o plano Pro.
        </p>

        <div className="bg-zinc-50 rounded-md p-3 mb-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Plano Pro</p>
          <p className="text-lg font-bold text-zinc-900">R$ 19,90/mês</p>
          <ul className="text-xs text-zinc-600 mt-2 space-y-1">
            <li>✅ Transações ilimitadas</li>
            <li>✅ Previsão de caixa</li>
            <li>✅ Relatório mensal (CSV)</li>
            <li>✅ Gráfico de evolução</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-xs text-amber-800">
            💬 Para assinar, fale conosco pelo WhatsApp. Vamos te enviar um link de
            pagamento (Pix, cartão ou boleto) e liberar seu acesso assim que
            confirmarmos.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onFechar}>
            Depois
          </Button>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              💬 Falar no WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}