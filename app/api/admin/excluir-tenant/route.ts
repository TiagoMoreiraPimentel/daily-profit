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

    const { tenantId } = await request.json()

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant obrigatório' }, { status: 400 })
    }

    // Usa admin client para deletar em cascata
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Deleta o tenant (cascata apaga users, transactions, subscriptions, etc.)
    const { error } = await supabaseAdmin
      .from('tenants')
      .delete()
      .eq('id', tenantId)

    if (error) {
      console.error('Erro ao excluir tenant:', error)
      return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
    }

    console.log(`✅ Tenant ${tenantId} excluído`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}