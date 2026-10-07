import { Suspense } from 'react'
import { connection } from 'next/server'
import { AtualizarSenhaForm } from './form'

export default function AtualizarSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4"><p className="text-sm text-zinc-500">Carregando...</p></div>}>
      <AtualizarSenhaContent />
    </Suspense>
  )
}

async function AtualizarSenhaContent() {
  await connection()

  return <AtualizarSenhaForm />
}