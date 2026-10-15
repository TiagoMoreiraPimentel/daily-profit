import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
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

    // Busca carteiras
    const { data: carteiras } = await supabase
      .from('carteiras')
      .select('id, nome, tipo, saldo_inicial, cor')
      .eq('tenant_id', profile.tenant_id)
      .order('nome')

    if (!carteiras || carteiras.length === 0) {
      return NextResponse.json({ saldos: [], total: 0 })
    }

    // Busca todas as transações vinculadas a carteiras
    const { data: transacoes } = await supabase
      .from('transactions')
      .select('carteira_id, tipo, valor')
      .not('carteira_id', 'is', null)

    const saldos = carteiras.map((c) => {
      const txs = transacoes?.filter((t) => t.carteira_id === c.id) ?? []
      const entradas = txs
        .filter((t) => t.tipo === 'entrada')
        .reduce((acc, t) => acc + Number(t.valor), 0)
      const saidas = txs
        .filter((t) => t.tipo === 'saida')
        .reduce((acc, t) => acc + Number(t.valor), 0)

      const saldoAtual = Number(c.saldo_inicial) + entradas - saidas

      return {
        id: c.id,
        nome: c.nome,
        tipo: c.tipo,
        cor: c.cor,
        saldo_inicial: Number(c.saldo_inicial),
        entradas,
        saidas,
        saldo_atual: saldoAtual,
      }
    })

    const total = saldos.reduce((acc, s) => acc + s.saldo_atual, 0)

    return NextResponse.json({ saldos, total })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}