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

  // Pro: verificar se existe assinatura real
  const { data: assinatura } = await supabase
    .from('subscriptions')
    .select('status, ultimo_pagamento, proxima_cobranca')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle()

  // Pro concedido manualmente (sem assinatura no MP)
  if (!assinatura) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-green-900">
          🎁 Plano Pro concedido
        </p>
        <p className="text-xs text-green-700 mt-1">
          Aproveite todos os recursos do Pro sem custo.
        </p>
      </div>
    )
  }

  const status = assinatura.status
  const proxima = formatarData(assinatura.proxima_cobranca ?? null)

  if (status === 'authorized') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium text-green-900">
            ⭐ Assinatura Pro ativa
          </p>
          {proxima && (
            <p className="text-xs text-green-700 mt-1">
              Renova em <strong>{proxima}</strong> · R$ 19,90/mês
            </p>
          )}
        </div>
      </div>
    )
  }

  if (status === 'paused') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-orange-900">
          ⏸️ Assinatura Pro pausada
        </p>
        <p className="text-xs text-orange-700 mt-1">
          Renove para continuar com os benefícios do Pro.
        </p>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-red-900">❌ Assinatura cancelada</p>
        <p className="text-xs text-red-700 mt-1">
          Assine novamente para voltar ao Pro.
        </p>
      </div>
    )
  }

  // pending (aguardando pagamento real)
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <p className="text-sm font-medium text-amber-900">⏳ Assinatura Pro pendente</p>
      <p className="text-xs text-amber-700 mt-1">
        Aguardando confirmação do pagamento.
      </p>
    </div>
  )
}