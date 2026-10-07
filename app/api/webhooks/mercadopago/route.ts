import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente com service_role (ignora RLS — só use no backend)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('🔔 Webhook recebido:', JSON.stringify(body, null, 2))

    const { type, data } = body

    if (!data?.id) {
      console.log('Webhook sem data.id, ignorando')
      return NextResponse.json({ received: true })
    }

    // Trata eventos de assinatura (preapproval)
    if (
      type === 'subscription_preapproval' ||
      type === 'preapproval'
    ) {
      await tratarAssinatura(data.id)
    }

    // Trata eventos de cobrança recorrente
    if (
      type === 'subscription_authorized_payment' ||
      type === 'authorized_payment'
    ) {
      await tratarPagamentoAutorizado(data.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

async function tratarAssinatura(preapprovalId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

  // Busca os dados atualizados da assinatura no Mercado Pago
  const res = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!res.ok) {
    console.error('Erro ao buscar assinatura no MP:', await res.text())
    return
  }

  const assinatura = await res.json()
  console.log('📋 Assinatura:', {
    id: assinatura.id,
    status: assinatura.status,
    external_reference: assinatura.external_reference,
    next_payment_date: assinatura.next_payment_date,
  })

  const tenantId = assinatura.external_reference
  if (!tenantId) {
    console.log('Sem external_reference, ignorando')
    return
  }

  const status = assinatura.status // 'pending', 'authorized', 'paused', 'cancelled'
  const plano = status === 'authorized' ? 'pro' : 'free'
  const proximaCobranca = assinatura.next_payment_date
    ? assinatura.next_payment_date.split('T')[0]
    : null

  // Atualiza a tabela subscriptions
  await supabaseAdmin.from('subscriptions').upsert(
    {
      tenant_id: tenantId,
      mp_preapproval_id: preapprovalId,
      plano,
      status,
      proxima_cobranca: proximaCobranca,
    },
    { onConflict: 'tenant_id' }
  )

  // Atualiza o plano do tenant
  await supabaseAdmin
    .from('tenants')
    .update({ plano })
    .eq('id', tenantId)

  console.log(`✅ Tenant ${tenantId} atualizado para plano "${plano}" (status: ${status})`)
}

async function tratarPagamentoAutorizado(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

  const res = await fetch(
    `https://api.mercadopago.com/authorized_payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!res.ok) {
    console.error('Erro ao buscar pagamento:', await res.text())
    return
  }

  const pagamento = await res.json()
  console.log('💰 Pagamento autorizado:', {
    id: pagamento.id,
    status: pagamento.status,
    preapproval_id: pagamento.preapproval_id,
  })

  // Quando o pagamento é aprovado, garante que o tenant é pro
  if (pagamento.status === 'approved' && pagamento.preapproval_id) {
    // Busca a assinatura para pegar o external_reference
    const assinaturaRes = await fetch(
      `https://api.mercadopago.com/preapproval/${pagamento.preapproval_id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (assinaturaRes.ok) {
      const assinatura = await assinaturaRes.json()
      const tenantId = assinatura.external_reference

      if (tenantId) {
        await supabaseAdmin
          .from('tenants')
          .update({ plano: 'pro' })
          .eq('id', tenantId)

        console.log(`✅ Pagamento aprovado — Tenant ${tenantId} confirmado como PRO`)
      }
    }
  }
}