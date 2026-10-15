import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('carteiras')
      .select('id, nome, tipo, saldo_inicial, cor, criado_em')
      .order('nome')

    if (error) {
      console.error('Erro ao buscar carteiras:', error)
      return NextResponse.json({ error: 'Erro ao buscar carteiras' }, { status: 500 })
    }

    return NextResponse.json({ carteiras: data ?? [] })
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

    const { nome, tipo, saldo_inicial, cor } = await request.json()

    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
    }

    if (!['banco', 'digital', 'dinheiro', 'outro'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('carteiras')
      .insert({
        tenant_id: profile.tenant_id,
        nome: nome.trim(),
        tipo,
        saldo_inicial: Number(saldo_inicial) || 0,
        cor: cor || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma carteira com esse nome' },
          { status: 409 }
        )
      }
      console.error('Erro ao criar carteira:', error)
      return NextResponse.json({ error: 'Erro ao criar carteira' }, { status: 500 })
    }

    return NextResponse.json({ carteira: data })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}