import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(request: Request) {
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

    const { nome_negocio, tipo } = await request.json()

    if (!nome_negocio?.trim()) {
      return NextResponse.json(
        { error: 'Nome do negócio é obrigatório' },
        { status: 400 }
      )
    }

    const tiposValidos = ['autonomo', 'mei', 'informal', 'outro']
    if (tipo && !tiposValidos.includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const updates: Record<string, any> = {
      nome_negocio: nome_negocio.trim(),
    }
    if (tipo) updates.tipo = tipo

    const { error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', profile.tenant_id)

    if (error) {
      console.error('Erro ao atualizar perfil:', error)
      return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id, tenants(nome_negocio, tipo)')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    const tenant = profile.tenants as
      | { nome_negocio?: string; tipo?: string }
      | null

    return NextResponse.json({
      nome_negocio: tenant?.nome_negocio ?? '',
      tipo: tenant?.tipo ?? 'autonomo',
      email: user.email,
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}