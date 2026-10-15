import { Suspense } from 'react'
import { connection } from 'next/server'
import { LoginForm } from './form'

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginContent />
    </Suspense>
  )
}

async function LoginContent() {
  await connection()

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}

function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-96 bg-white rounded-xl border border-zinc-200/80 animate-pulse" />
    </div>
  )
}