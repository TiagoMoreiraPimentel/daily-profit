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

    // Busca transações recorrentes ativas
    const { data: recorrentes } = await supabase
      .from('recurring')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('ativo', true)

    // Busca transações do mês atual
    const primeiroDiaMes = new Date()
    primeiroDiaMes.setDate(1)
    const dataInicio = primeiroDiaMes.toISOString().split('T')[0]

    const { data: transacoes } = await supabase
      .from('transactions')
      .select('tipo, valor, natureza')
      .gte('data', dataInicio)

    const entradasMes =
      transacoes
        ?.filter((t) => t.tipo === 'entrada' && t.natureza === 'negocio')
        .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

    const saidasMes =
      transacoes
        ?.filter((t) => t.tipo === 'saida' && t.natureza === 'negocio')
        .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

    const entradasRecorrentes =
      recorrentes
        ?.filter((r) => r.tipo === 'entrada')
        .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0

    const saidasRecorrentes =
      recorrentes
        ?.filter((r) => r.tipo === 'saida')
        .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0

    // Projeção para o fim do mês:
    // O que já entrou/saiu + o que ainda vai entrar/sair (recorrentes)
    const projecaoEntradas = entradasMes + entradasRecorrentes
    const projecaoSaidas = saidasMes + saidasRecorrentes
    const projecaoLucro = projecaoEntradas - projecaoSaidas

    return NextResponse.json({
      realizado: {
        entradas: entradasMes,
        saidas: saidasMes,
        lucro: entradasMes - saidasMes,
      },
      previsto: {
        entradas: entradasRecorrentes,
        saidas: saidasRecorrentes,
      },
      projecao: {
        entradas: projecaoEntradas,
        saidas: projecaoSaidas,
        lucro: projecaoLucro,
      },
      recorrentes: recorrentes ?? [],
    })
  } catch (error) {
    console.error('Erro na previsão:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}