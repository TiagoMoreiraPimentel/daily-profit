import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getStatusPlano } from '@/lib/plano'
import { ProBloqueio } from '@/components/pro-bloqueio'
import { PrevisaoContent } from './content'

export default function PrevisaoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 p-8 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      }
    >
      <PrevisaoWrapper />
    </Suspense>
  )
}

async function PrevisaoWrapper() {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const status = await getStatusPlano()

  if (status?.plano !== 'pro') {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
        <ProBloqueio
          titulo="Previsão de Caixa é exclusiva do Pro"
          descricao="Saiba quanto você deve ter no fim do mês com base nas suas contas recorrentes."
        />
      </div>
    )
  }

  return <PrevisaoContent />
}