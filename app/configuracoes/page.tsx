import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { ConfiguracoesContent } from './content'

export default function ConfiguracoesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 p-8 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      }
    >
      <ConfiguracoesWrapper />
    </Suspense>
  )
}

async function ConfiguracoesWrapper() {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <ConfiguracoesContent />
}