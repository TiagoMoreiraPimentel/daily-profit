import { createClient } from '@/lib/supabase-server'

export async function getStatusPlano() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, tenants(plano)')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const plano = (profile.tenants as { plano?: string } | null)?.plano ?? 'free'

  if (plano === 'pro') {
    return {
      plano: 'pro' as const,
      transacoesMes: 0,
      limite: null,
      percentual: 0,
      podeInserir: true,
    }
  }

  const primeiroDiaMes = new Date()
  primeiroDiaMes.setDate(1)
  const dataInicio = primeiroDiaMes.toISOString().split('T')[0]

  const { count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', profile.tenant_id)
    .gte('data', dataInicio)

  const transacoesMes = count ?? 0
  const limite = 30

  return {
    plano: 'free' as const,
    transacoesMes,
    limite,
    percentual: Math.min((transacoesMes / limite) * 100, 100),
    podeInserir: transacoesMes < limite,
  }
}