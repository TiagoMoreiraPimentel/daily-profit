'use client'

import { Button } from '@/components/ui/button'

const WHATSAPP_NUMERO = '5511992233306'
const WHATSAPP_MENSAGEM = encodeURIComponent(
  'Olá! Quero assinar o plano Pro do Daily Profit. Pode me enviar o link de pagamento?'
)

export function AssinarButton() {
  const href = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAGEM}`

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button
        size="sm"
        className="bg-amber-500 hover:bg-amber-600 text-white"
      >
        ⭐ Assinar Pro
      </Button>
    </a>
  )
}