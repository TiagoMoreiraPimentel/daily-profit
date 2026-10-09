import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id, tipo, valor, descricao, natureza } = await request.json()

    if (!id || !tipo || !valor) {
      return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 })
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        tipo,
        valor: Number(valor),
        descricao: descricao?.trim() || null,
        natureza,
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao editar:', error)
      return NextResponse.json({ error: 'Erro ao editar' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}