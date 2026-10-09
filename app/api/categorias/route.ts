import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const natureza = searchParams.get('natureza')

    let query = supabase
      .from('categorias')
      .select('id, nome, tipo, natureza')
      .order('nome')

    if (tipo) query = query.eq('tipo', tipo)
    if (natureza) query = query.eq('natureza', natureza)

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    return NextResponse.json({ categorias: data ?? [] })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { nome, tipo, natureza } = await request.json()

    if (!nome?.trim() || !tipo || !natureza) {
      return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 })
    }

    if (!['entrada', 'saida'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    if (!['negocio', 'pessoal'].includes(natureza)) {
      return NextResponse.json({ error: 'Natureza inválida' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert({
        tenant_id: profile.tenant_id,
        nome: nome.trim(),
        tipo,
        natureza,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma categoria com esse nome' },
          { status: 409 }
        )
      }
      console.error('Erro ao criar categoria:', error)
      return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
    }

    return NextResponse.json({ categoria: data })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}