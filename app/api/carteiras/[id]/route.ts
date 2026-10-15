import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params
    const { nome, tipo, saldo_inicial, cor } = await request.json()

    const updates: Record<string, any> = {}
    if (nome?.trim()) updates.nome = nome.trim()
    if (tipo) updates.tipo = tipo
    if (saldo_inicial !== undefined) updates.saldo_inicial = Number(saldo_inicial) || 0
    if (cor !== undefined) updates.cor = cor || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })
    }

    const { error } = await supabase
      .from('carteiras')
      .update(updates)
      .eq('id', id)

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma carteira com esse nome' },
          { status: 409 }
        )
      }
      console.error('Erro ao atualizar carteira:', error)
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params

    // Verifica se existem transações vinculadas
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('carteira_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Esta carteira tem ${count} transação(ões) vinculada(s). Exclua ou reatribua antes.`,
        },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('carteiras')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir carteira:', error)
      return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}