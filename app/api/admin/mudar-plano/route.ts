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

    const { tenantId, novoPlano } = await request.json()

    if (!tenantId || !novoPlano) {
      return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 })
    }

    if (!['free', 'pro', 'super'].includes(novoPlano)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    // Usa admin client para atualizar
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabaseAdmin
      .from('tenants')
      .update({ plano: novoPlano })
      .eq('id', tenantId)

    if (error) {
      console.error('Erro ao mudar plano:', error)
      return NextResponse.json({ error: 'Erro ao mudar plano' }, { status: 500 })
    }

    console.log(`✅ Plano do tenant ${tenantId} → ${novoPlano}`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}