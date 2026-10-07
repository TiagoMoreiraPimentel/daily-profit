import { Suspense } from 'react'
import { connection } from 'next/server'
import { EsqueciSenhaForm } from './form'

export default function EsqueciSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4"><p className="text-sm text-zinc-500">Carregando...</p></div>}>
      <EsqueciSenhaContent />
    </Suspense>
  )
}

async function EsqueciSenhaContent() {
  await connection()
  return <EsqueciSenhaForm />
}