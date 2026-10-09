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

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Busca os usuários do tenant (antes de apagar)
    const { data: usuarios } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('tenant_id', tenantId)

    // 2. Apaga o tenant (cascata apaga users, transactions, etc.)
    const { error: tenantError } = await supabaseAdmin
      .from('tenants')
      .delete()
      .eq('id', tenantId)

    if (tenantError) {
      console.error('Erro ao excluir tenant:', tenantError)
      return NextResponse.json({ error: 'Erro ao excluir tenant' }, { status: 500 })
    }

    // 3. Apaga os usuários do auth.users
    if (usuarios && usuarios.length > 0) {
      for (const u of usuarios) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(u.id)
        if (authError) {
          console.error(`Erro ao apagar auth.users ${u.email}:`, authError)
          // Continua mesmo se um falhar
        } else {
          console.log(`✅ auth.users apagado: ${u.email}`)
        }
      }
    }

    console.log(`✅ Tenant ${tenantId} excluído completamente`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}