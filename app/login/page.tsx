import { Suspense } from 'react'
import { connection } from 'next/server'
import { LoginForm } from './form'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4"><p className="text-sm text-zinc-500">Carregando...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}

async function LoginContent() {
  await connection()
  return <LoginForm />
}