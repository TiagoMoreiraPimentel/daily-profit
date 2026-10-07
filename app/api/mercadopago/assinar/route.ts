import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { preapproval_plan_id, card_token_id, payer_email } = await request.json()

    if (!preapproval_plan_id || !card_token_id) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      )
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!accessToken) {
      return NextResponse.json(
        { error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' },
        { status: 500 }
      )
    }

    // Busca o tenant do usuário
    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    // Cria a assinatura no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preapproval_plan_id,
        reason: 'Daily Profit - Plano Pro',
        external_reference: profile.tenant_id,
        payer_email: payer_email || 'test_user_8813910146543731310@testuser.com',
        card_token_id,
        back_url: `${appUrl}/dashboard`,
        status: 'authorized',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erro ao criar assinatura no MP:', data)
      return NextResponse.json(
        { error: data.message || 'Erro ao criar assinatura' },
        { status: response.status }
      )
    }

    console.log('✅ Assinatura criada no MP:', {
      id: data.id,
      status: data.status,
      external_reference: data.external_reference,
    })

    // Salva a assinatura no banco
    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          tenant_id: profile.tenant_id,
          mp_preapproval_id: data.id,
          plano: 'pro',
          status: data.status || 'pending',
        },
        { onConflict: 'tenant_id' }
      )

    if (upsertError) {
      console.error('❌ Erro ao salvar assinatura no banco:', JSON.stringify(upsertError, null, 2))
      return NextResponse.json(
        { error: 'Erro ao salvar assinatura no banco', detalhes: upsertError },
        { status: 500 }
      )
    }

    console.log('✅ Assinatura salva no banco:', {
      tenant_id: profile.tenant_id,
      mp_preapproval_id: data.id,
      status: data.status,
    })

    // Atualiza o plano do tenant imediatamente (não espera webhook)
    const { error: tenantError } = await supabase
      .from('tenants')
      .update({ plano: 'pro' })
      .eq('id', profile.tenant_id)

    if (tenantError) {
      console.error('⚠️ Erro ao atualizar tenant (não bloqueante):', tenantError)
    } else {
      console.log('✅ Tenant atualizado para PRO:', profile.tenant_id)
    }

    return NextResponse.json({
      preapproval_id: data.id,
      init_point: data.init_point,
      status: data.status,
    })
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}