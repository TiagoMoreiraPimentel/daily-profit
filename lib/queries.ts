import { createClient } from '@/lib/supabase-server'

export async function getResumoHoje() {
  const supabase = await createClient()
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza')
    .eq('data', hoje)

  if (error) throw error

  const negocio = data?.filter((t) => t.natureza === 'negocio') ?? []
  const pessoal = data?.filter((t) => t.natureza === 'pessoal') ?? []

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

  return {
    entrou: entrouNegocio,
    saiu: saiuNegocio,
    lucro: entrouNegocio - saiuNegocio,
    pessoalLiquido: entrouPessoal - saiuPessoal,
    entrouPessoal,
    saiuPessoal,
  }
}

export async function getResumoMes() {
  const supabase = await createClient()

  const primeiroDiaMes = new Date()
  primeiroDiaMes.setDate(1)
  const dataInicio = primeiroDiaMes.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('tipo, valor, natureza')
    .gte('data', dataInicio)

  if (error) throw error

  const negocio = data?.filter((t) => t.natureza === 'negocio') ?? []
  const pessoal = data?.filter((t) => t.natureza === 'pessoal') ?? []

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

  const lucroNegocio = entrouNegocio - saiuNegocio
  const pessoalLiquido = entrouPessoal - saiuPessoal

  return {
    entrou: entrouNegocio,
    saiu: saiuNegocio,
    lucro: lucroNegocio,
    pessoalLiquido,
    entrouPessoal,
    saiuPessoal,
    sobrouDeVerdade: lucroNegocio + pessoalLiquido,
  }
}

export async function getTransacoesHoje() {
  const supabase = await createClient()
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('data', hoje)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data ?? []
}