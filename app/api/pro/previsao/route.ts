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

    const hoje = new Date()
    const anoAtual = hoje.getFullYear()
    const mesAtual = hoje.getMonth() // 0-11
    const diaAtual = hoje.getDate()
    const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0).getDate()

    // =============================================
    // 1. Ritmo do mês atual (extrapola o que já foi feito)
    // =============================================
    const primeiroDiaMesAtual = new Date(anoAtual, mesAtual, 1)
    const dataInicioAtual = primeiroDiaMesAtual.toISOString().split('T')[0]

    const { data: transacoesMesAtual } = await supabase
      .from('transactions')
      .select('tipo, valor, natureza')
      .gte('data', dataInicioAtual)

    const entradasMesAtual =
      transacoesMesAtual
        ?.filter((t) => t.tipo === 'entrada' && t.natureza === 'negocio')
        .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

    const saidasMesAtual =
      transacoesMesAtual
        ?.filter((t) => t.tipo === 'saida' && t.natureza === 'negocio')
        .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

    const ritmoEntradas =
      diaAtual > 0 ? (entradasMesAtual / diaAtual) * ultimoDiaMes : 0
    const ritmoSaidas = diaAtual > 0 ? (saidasMesAtual / diaAtual) * ultimoDiaMes : 0

    // =============================================
    // 2. Média dos últimos 3 meses fechados
    // =============================================
    const tresMesesAtras = new Date(anoAtual, mesAtual - 3, 1)
    const dataInicio3Meses = tresMesesAtras.toISOString().split('T')[0]
    const ultimoDiaMesAnterior = new Date(anoAtual, mesAtual, 0)
    const dataFim3Meses = ultimoDiaMesAnterior.toISOString().split('T')[0]

    const { data: transacoes3Meses } = await supabase
      .from('transactions')
      .select('tipo, valor, natureza, data')
      .gte('data', dataInicio3Meses)
      .lte('data', dataFim3Meses)

    // Agrupa por mês
    const porMes: Record<string, { entradas: number; saidas: number }> = {}

    transacoes3Meses
      ?.filter((t) => t.natureza === 'negocio')
      .forEach((t) => {
        const mes = t.data.substring(0, 7) // YYYY-MM
        if (!porMes[mes]) porMes[mes] = { entradas: 0, saidas: 0 }
        if (t.tipo === 'entrada') porMes[mes].entradas += Number(t.valor)
        else porMes[mes].saidas += Number(t.valor)
      })

    const mesesComDados = Object.values(porMes)
    const qtdMeses = mesesComDados.length

    const mediaEntradas =
      qtdMeses > 0
        ? mesesComDados.reduce((acc, m) => acc + m.entradas, 0) / qtdMeses
        : 0
    const mediaSaidas =
      qtdMeses > 0
        ? mesesComDados.reduce((acc, m) => acc + m.saidas, 0) / qtdMeses
        : 0

    // =============================================
    // 3. Contas recorrentes cadastradas
    // =============================================
    const { data: recorrentes } = await supabase
      .from('recurring')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('ativo', true)

    const recorrentesEntradas =
      recorrentes
        ?.filter((r) => r.tipo === 'entrada')
        .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0
    const recorrentesSaidas =
      recorrentes
        ?.filter((r) => r.tipo === 'saida')
        .reduce((acc, r) => acc + Number(r.valor), 0) ?? 0

    // =============================================
    // 4. Previsão final = média (tendência + histórico) + recorrentes
    // =============================================
    // Se temos 3 meses de dados, damos mais peso à média histórica
    // Se temos poucos dados, damos mais peso ao ritmo do mês atual
    const pesoMedia = qtdMeses >= 2 ? 0.7 : 0.3
    const pesoRitmo = 1 - pesoMedia

    const previsaoEntradas =
      mediaEntradas * pesoMedia + ritmoEntradas * pesoRitmo + recorrentesEntradas
    const previsaoSaidas =
      mediaSaidas * pesoMedia + ritmoSaidas * pesoRitmo + recorrentesSaidas

    return NextResponse.json({
      // O que já foi realizado neste mês
      realizadoMes: {
        entradas: entradasMesAtual,
        saidas: saidasMesAtual,
        lucro: entradasMesAtual - saidasMesAtual,
      },
      // Média histórica dos últimos 3 meses fechados
      mediaHistorica: {
        entradas: mediaEntradas,
        saidas: mediaSaidas,
        lucro: mediaEntradas - mediaSaidas,
        mesesConsiderados: qtdMeses,
      },
      // Ritmo atual extrapolado para o mês inteiro
      ritmoAtual: {
        entradas: ritmoEntradas,
        saidas: ritmoSaidas,
        lucro: ritmoEntradas - ritmoSaidas,
      },
      // Contas recorrentes
      recorrentes: {
        entradas: recorrentesEntradas,
        saidas: recorrentesSaidas,
        lista: recorrentes ?? [],
      },
      // Previsão final do próximo mês
      previsaoProximoMes: {
        entradas: previsaoEntradas,
        saidas: previsaoSaidas,
        lucro: previsaoEntradas - previsaoSaidas,
      },
      // Metadados
      diasDecorridos: diaAtual,
      diasNoMes: ultimoDiaMes,
    })
  } catch (error) {
    console.error('Erro na previsão:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}