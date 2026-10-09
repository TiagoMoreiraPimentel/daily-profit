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
    const { nome } = await request.json()

    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from('categorias')
      .update({ nome: nome.trim() })
      .eq('id', id)

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe uma categoria com esse nome' },
          { status: 409 }
        )
      }
      console.error('Erro ao renomear:', error)
      return NextResponse.json({ error: 'Erro ao renomear' }, { status: 500 })
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

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir:', error)
      return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}