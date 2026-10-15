import { Suspense } from 'react'
import { connection } from 'next/server'
import { CadastroForm } from './form'

export default function CadastroPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <CadastroContent />
    </Suspense>
  )
}

async function CadastroContent() {
  await connection()

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <CadastroForm />
    </div>
  )
}

function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[500px] bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
    </div>
  )
}