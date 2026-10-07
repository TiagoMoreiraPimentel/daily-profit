import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    const { data: assinatura } = await supabase
      .from('subscriptions')
      .select('mp_preapproval_id')
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!assinatura?.mp_preapproval_id) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const res = await fetch(
      `https://api.mercadopago.com/preapproval/${assinatura.mp_preapproval_id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao consultar MP' }, { status: 500 })
    }

    const mpData = await res.json()
    const status = mpData.status
    const plano = status === 'authorized' ? 'pro' : 'free'
    const proximaCobranca = mpData.next_payment_date
      ? mpData.next_payment_date.split('T')[0]
      : null

    await supabase
      .from('tenants')
      .update({ plano })
      .eq('id', profile.tenant_id)

    await supabase
      .from('subscriptions')
      .update({ status, plano, proxima_cobranca: proximaCobranca })
      .eq('tenant_id', profile.tenant_id)

    return NextResponse.json({ status, plano })
  } catch (error) {
    console.error('Erro ao sincronizar:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}