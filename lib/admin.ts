import { createClient } from '@/lib/supabase-server'

export async function isSuper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('tenants(plano)')
    .eq('id', user.id)
    .single()

  const plano = (data?.tenants as { plano?: string } | null)?.plano
  return plano === 'super'
}

export async function getAdminInfo() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('nome, tenants(plano)')
    .eq('id', user.id)
    .single()

  if (!data) return null

  const plano = (data.tenants as { plano?: string } | null)?.plano
  if (plano !== 'super') return null

  return {
    nome: data.nome,
    email: user.email,
  }
}