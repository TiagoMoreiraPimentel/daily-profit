import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { preapproval_plan_id, card_token_id, payer_email } = await request.json()

    if (!preapproval_plan_id || !card_token_id) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

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
        payer_email: 'test_user_8813910146543731310@testuser.com',
        card_token_id,
        back_url: `${appUrl}/dashboard`,
        status: 'authorized', // ← OBRIGATÓRIO para plano associado
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Erro ao criar assinatura:', data)
      return NextResponse.json({ error: data.message || 'Erro' }, { status: response.status })
    }

    await supabase.from('subscriptions').upsert(
      {
        tenant_id: profile.tenant_id,
        mp_preapproval_id: data.id,
        plano: 'pro',
        status: data.status,
      },
      { onConflict: 'tenant_id' }
    )

    return NextResponse.json({
      preapproval_id: data.id,
      status: data.status,
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}