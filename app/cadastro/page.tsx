import { Suspense } from 'react'
import { connection } from 'next/server'
import { CadastroForm } from './form'

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4"><p className="text-sm text-zinc-500">Carregando...</p></div>}>
      <CadastroContent />
    </Suspense>
  )
}

async function CadastroContent() {
  await connection()
  return <CadastroForm />
}