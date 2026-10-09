import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const body = await request.json()
    console.log('🔔 Webhook recebido:', JSON.stringify(body, null, 2))

    let tipo = body.type
    let dataId = body.data?.id

    if (!tipo && body.topic) tipo = body.topic
    if (!dataId && body.resource) {
      dataId = String(body.resource).split('/').pop()
    }

    console.log('📌 Tipo detectado:', tipo, '| ID:', dataId)

    if (!dataId) {
      return NextResponse.json({ received: true })
    }

    try {
      if (tipo === 'subscription_preapproval' || tipo === 'preapproval') {
        await tratarAssinatura(dataId, supabaseAdmin)
      }

      if (
        tipo === 'subscription_authorized_payment' ||
        tipo === 'authorized_payment'
      ) {
        await tratarPagamentoAutorizado(dataId, supabaseAdmin)
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

// =====================================================
// ASSINATURA (plano Pro)
// =====================================================
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

// =====================================================
// PAGAMENTO AUTORIZADO (cobrança recorrente da assinatura)
// =====================================================
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
    date_created: pagamento.date_created,
    payment_date: pagamento.payment_date,
  })

  if (pagamento.status !== 'approved' || !pagamento.preapproval_id) {
    console.log('Pagamento não aprovado ou sem preapproval_id, ignorando')
    return
  }

  // Busca a assinatura para pegar o external_reference e a próxima cobrança
  const assinaturaRes = await fetch(
    `https://api.mercadopago.com/preapproval/${pagamento.preapproval_id}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!assinaturaRes.ok) {
    console.error('Erro ao buscar assinatura:', await assinaturaRes.text())
    return
  }

  const assinatura = await assinaturaRes.json()
  const tenantId = assinatura.external_reference

  if (!tenantId) {
    console.log('Sem external_reference na assinatura, ignorando')
    return
  }

  const dataPagamento = pagamento.payment_date
    ? pagamento.payment_date.split('T')[0]
    : pagamento.date_created
    ? pagamento.date_created.split('T')[0]
    : new Date().toISOString().split('T')[0]

  const proximaCobranca = assinatura.next_payment_date
    ? assinatura.next_payment_date.split('T')[0]
    : null

  // Atualiza a assinatura com data do último pagamento + próxima cobrança
  await supabaseAdmin
    .from('subscriptions')
    .update({
      ultimo_pagamento: dataPagamento,
      proxima_cobranca: proximaCobranca,
      status: 'authorized',
      plano: 'pro',
    })
    .eq('tenant_id', tenantId)

  // Garante que o tenant está como pro
  await supabaseAdmin
    .from('tenants')
    .update({ plano: 'pro' })
    .eq('id', tenantId)

  console.log(
    `✅ Pagamento registrado — Tenant ${tenantId} | Último: ${dataPagamento} | Próximo: ${proximaCobranca}`
  )
}