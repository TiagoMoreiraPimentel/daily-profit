'use client'

import { Button } from '@/components/ui/button'

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function escaparCampo(valor: string) {
  if (valor.includes(';') || valor.includes('\n') || valor.includes('"')) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

export function ExportarCSV({
  dados,
  mes,
  nomeNegocio,
}: {
  dados: any
  mes: string
  nomeNegocio?: string
}) {
  function exportar() {
    const linhas: string[] = []

    // Cabeçalho
    linhas.push(escaparCampo('Relatório Daily Profit'))
    linhas.push(
      `${escaparCampo('Negócio')};${escaparCampo(nomeNegocio || 'Meu Negócio')}`
    )
    linhas.push(`${escaparCampo('Período')};${escaparCampo(mes)}`)
    linhas.push(
      `${escaparCampo('Emitido em')};${escaparCampo(
        new Date().toLocaleString('pt-BR')
      )}`
    )
    linhas.push('')

    // Resumo
    linhas.push('RESUMO')
    linhas.push('Indicador;Valor')
    linhas.push(`Lucro do negócio;${escaparCampo(formatarMoeda(dados.negocio.lucro))}`)
    linhas.push(`Pessoal líquido;${escaparCampo(formatarMoeda(dados.pessoal.liquido))}`)
    linhas.push(`Sobrou de verdade;${escaparCampo(formatarMoeda(dados.sobrouDeVerdade))}`)
    linhas.push('')

    // Movimentações do negócio
    linhas.push('MOVIMENTAÇÕES DO NEGÓCIO')
    linhas.push('Indicador;Valor')
    linhas.push(`Entradas;${escaparCampo(formatarMoeda(dados.negocio.entrou))}`)
    linhas.push(`Saídas;${escaparCampo(formatarMoeda(dados.negocio.saiu))}`)
    linhas.push('')

    // Movimentações pessoais
    linhas.push('MOVIMENTAÇÕES PESSOAIS')
    linhas.push('Indicador;Valor')
    linhas.push(`Entradas;${escaparCampo(formatarMoeda(dados.pessoal.entrou))}`)
    linhas.push(`Saídas;${escaparCampo(formatarMoeda(dados.pessoal.saiu))}`)
    linhas.push('')

    // Categorias — separadas por entrada e saída
    const todasCategorias = Object.entries(dados.porCategoria).map(
      ([nome, valores]: [string, any]) => ({
        nome,
        entrada: valores.entrada,
        saida: valores.saida,
        saldo: valores.entrada - valores.saida,
      })
    )

    const entradas = todasCategorias
      .filter((c) => c.entrada > 0)
      .sort((a, b) => b.entrada - a.entrada)

    const saidas = todasCategorias
      .filter((c) => c.saida > 0)
      .sort((a, b) => b.saida - a.saida)

    // Seção de entradas por categoria
    if (entradas.length > 0) {
      linhas.push('ENTRADAS POR CATEGORIA')
      linhas.push('Categoria;Valor')
      entradas.forEach((c) => {
        linhas.push(
          [escaparCampo(c.nome), escaparCampo(formatarMoeda(c.entrada))].join(';')
        )
      })
      linhas.push(
        `Total;${escaparCampo(
          formatarMoeda(entradas.reduce((acc, c) => acc + c.entrada, 0))
        )}`
      )
      linhas.push('')
    }

    // Seção de saídas por categoria
    if (saidas.length > 0) {
      linhas.push('SAÍDAS POR CATEGORIA')
      linhas.push('Categoria;Valor')
      saidas.forEach((c) => {
        linhas.push(
          [escaparCampo(c.nome), escaparCampo(`-${formatarMoeda(c.saida)}`)].join(';')
        )
      })
      linhas.push(
        `Total;${escaparCampo(
          `-${formatarMoeda(saidas.reduce((acc, c) => acc + c.saida, 0))}`
        )}`
      )
      linhas.push('')
    }

    // Rodapé
    linhas.push('Gerado por Daily Profit — dailyprofit.com.br')

    // BOM UTF-8
    const BOM = '\uFEFF'
    const csv = BOM + linhas.join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `daily-profit-${mes.replace(/\s/g, '-').toLowerCase()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportar}
      className="bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50"
    >
      📥 Exportar CSV
    </Button>
  )
}