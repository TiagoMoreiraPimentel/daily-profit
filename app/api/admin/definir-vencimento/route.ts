import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verifica se é super
    const { data: meuPerfil } = await supabase
      .from('users')
      .select('tenants(plano)')
      .eq('id', user.id)
      .single()

    const meuPlano = (meuPerfil?.tenants as { plano?: string } | null)?.plano
    if (meuPlano !== 'super') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { tenantId, dataInicio } = await request.json()

    if (!tenantId || !dataInicio) {
      return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 })
    }

    // Valida formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicio)) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 })
    }

    const dataInicioObj = new Date(dataInicio + 'T12:00:00')
    if (isNaN(dataInicioObj.getTime())) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 })
    }

    // Calcula vencimento: 1 mês exato
    const dataVencimento = new Date(dataInicioObj)
    dataVencimento.setMonth(dataVencimento.getMonth() + 1)
    const vencimentoStr = dataVencimento.toISOString().split('T')[0]

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabaseAdmin
      .from('tenants')
      .update({
        plano: 'pro',
        plano_vencimento: vencimentoStr,
      })
      .eq('id', tenantId)

    if (error) {
      console.error('Erro ao definir vencimento:', error)
      return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
    }

    console.log(`✅ Tenant ${tenantId} → pro até ${vencimentoStr}`)

    return NextResponse.json({
      ok: true,
      plano_vencimento: vencimentoStr,
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}