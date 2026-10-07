'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ProBloqueio({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="max-w-lg mx-auto mt-20 text-center bg-white border border-zinc-200 rounded-lg p-8">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-zinc-900 mb-2">{titulo}</h2>
      <p className="text-sm text-zinc-600 mb-6">{descricao}</p>
      <Link href="/dashboard">
        <Button className="w-full">Voltar ao dashboard</Button>
      </Link>
      <p className="text-xs text-zinc-500 mt-4">
        Esta funcionalidade faz parte do plano <strong>Pro</strong> (R$ 19,90/mês).
      </p>
    </div>
  )
}