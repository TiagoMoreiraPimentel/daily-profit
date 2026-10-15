import { createClient } from '@/lib/supabase-server'

function formatarData(dataISO: string | null) {
  if (!dataISO) return null
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

export async function AssinaturaInfo() {
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

  // Super não tem cobrança
  if (plano === 'super') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-purple-900">
          ⭐ Plano Super (acesso administrativo)
        </p>
        <p className="text-xs text-purple-700 mt-1">Sem cobrança recorrente.</p>
      </div>
    )
  }

  // Free não vê nada
  if (plano === 'free') return null

  // Pro: verificar assinatura
  const { data: assinatura } = await supabase
    .from('subscriptions')
    .select('status, ultimo_pagamento, proxima_cobranca')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle()

  const proxima = formatarData(assinatura?.proxima_cobranca ?? null)
  const ultimo = formatarData(assinatura?.ultimo_pagamento ?? null)

  // Pro com assinatura ativa (via Mercado Pago)
  if (assinatura && assinatura.status === 'authorized') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-green-900">
          ⭐ Assinatura Pro ativa
        </p>
        {proxima && (
          <p className="text-xs text-green-700 mt-1">
            Renova em <strong>{proxima}</strong> · R$ 19,90/mês
          </p>
        )}
      </div>
    )
  }

  // Pro sem assinatura (liberado manualmente)
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <p className="text-sm font-medium text-green-900">
        ⭐ Plano Pro ativo
      </p>
      <p className="text-xs text-green-700 mt-1">
        Aproveite todos os recursos do Pro.
        {ultimo && ` Último pagamento: ${ultimo}.`}
      </p>
    </div>
  )
}