import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id, tenants(plano)')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    const plano = (profile.tenants as { plano?: string } | null)?.plano ?? 'free'
    if (plano !== 'pro') {
      return NextResponse.json({ error: 'Recurso exclusivo do plano Pro' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes') // formato YYYY-MM (ex: 2026-10)

    let dataInicio: string
    let dataFim: string

    if (mes) {
      const [ano, mesNum] = mes.split('-').map(Number)
      const inicio = new Date(ano, mesNum - 1, 1)
      const fim = new Date(ano, mesNum, 0)
      dataInicio = inicio.toISOString().split('T')[0]
      dataFim = fim.toISOString().split('T')[0]
    } else {
      const hoje = new Date()
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      dataInicio = inicio.toISOString().split('T')[0]
      dataFim = fim.toISOString().split('T')[0]
    }

    const { data: transacoes } = await supabase
      .from('transactions')
      .select('tipo, valor, natureza, categoria')
      .gte('data', dataInicio)
      .lte('data', dataFim)

    const negocio = transacoes?.filter((t) => t.natureza === 'negocio') ?? []
    const pessoal = transacoes?.filter((t) => t.natureza === 'pessoal') ?? []

    const entrouNegocio = negocio
      .filter((t) => t.tipo === 'entrada')
      .reduce((acc, t) => acc + Number(t.valor), 0)
    const saiuNegocio = negocio
      .filter((t) => t.tipo === 'saida')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const entrouPessoal = pessoal
      .filter((t) => t.tipo === 'entrada')
      .reduce((acc, t) => acc + Number(t.valor), 0)
    const saiuPessoal = pessoal
      .filter((t) => t.tipo === 'saida')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    // Agrupa por categoria
    const porCategoria: Record<string, { entrada: number; saida: number }> = {}

    negocio.forEach((t) => {
      const cat = t.categoria || 'Sem categoria'
      if (!porCategoria[cat]) porCategoria[cat] = { entrada: 0, saida: 0 }
      if (t.tipo === 'entrada') porCategoria[cat].entrada += Number(t.valor)
      else porCategoria[cat].saida += Number(t.valor)
    })

    return NextResponse.json({
      periodo: { inicio: dataInicio, fim: dataFim },
      negocio: {
        entrou: entrouNegocio,
        saiu: saiuNegocio,
        lucro: entrouNegocio - saiuNegocio,
        transacoes: negocio.length,
      },
      pessoal: {
        entrou: entrouPessoal,
        saiu: saiuPessoal,
        liquido: entrouPessoal - saiuPessoal,
        transacoes: pessoal.length,
      },
      sobrouDeVerdade: entrouNegocio - saiuNegocio + entrouPessoal - saiuPessoal,
      porCategoria,
    })
  } catch (error) {
    console.error('Erro no relatório:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}