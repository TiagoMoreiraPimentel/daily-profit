import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
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

    const body = await request.json()
    console.log('🔔 Webhook recebido:', JSON.stringify(body, null, 2))

    const { type, data } = body

    if (!data?.id) {
      console.log('Webhook sem data.id, ignorando')
      return NextResponse.json({ received: true })
    }

    try {
      if (type === 'subscription_preapproval' || type === 'preapproval') {
        await tratarAssinatura(data.id, supabaseAdmin)
      }

      if (
        type === 'subscription_authorized_payment' ||
        type === 'authorized_payment'
      ) {
        await tratarPagamentoAutorizado(data.id, supabaseAdmin)
      }
    } catch (innerError) {
      console.error('⚠️ Erro ao processar (ignorado):', innerError)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json({ received: true })
  }
}

async function tratarAssinatura(
  preapprovalId: string,
  supabaseAdmin: SupabaseClient
) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

  const res = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
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

  const status = assinatura.status
  const plano = status === 'authorized' ? 'pro' : 'free'
  const proximaCobranca = assinatura.next_payment_date
    ? assinatura.next_payment_date.split('T')[0]
    : null

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

  await supabaseAdmin
    .from('tenants')
    .update({ plano })
    .eq('id', tenantId)

  console.log(`✅ Tenant ${tenantId} → plano "${plano}" (status: ${status})`)
}

async function tratarPagamentoAutorizado(
  paymentId: string,
  supabaseAdmin: SupabaseClient
) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

  const res = await fetch(
    `https://api.mercadopago.com/authorized_payments/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
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

  if (pagamento.status === 'approved' && pagamento.preapproval_id) {
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