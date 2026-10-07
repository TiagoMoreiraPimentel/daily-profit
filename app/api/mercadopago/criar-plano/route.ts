import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!accessToken) {
      return NextResponse.json(
        { error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Daily Profit - Plano Pro',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          repetitions: 12,
          billing_day: 10,
          billing_day_proportional: true,
          free_trial: {
            frequency: 1,
            frequency_type: 'months',
          },
          transaction_amount: 19.9,
          currency_id: 'BRL',
        },
        payment_methods_allowed: {
          payment_types: [{ id: 'credit_card' }],
          payment_methods: [{ id: 'visa' }, { id: 'master' }],
        },
        back_url: `${appUrl}/dashboard`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro ao criar plano:', data)
      return NextResponse.json(
        { error: data.message || 'Erro ao criar plano', detalhes: data },
        { status: response.status }
      )
    }

    return NextResponse.json({
      preapproval_plan_id: data.id,
      init_point: data.init_point,
      status: data.status,
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}