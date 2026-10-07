'use client'

import { Button } from '@/components/ui/button'

export function ExportarCSV({ dados, mes }: { dados: any; mes: string }) {
  function exportar() {
    const linhas: string[] = []

    linhas.push('Relatório Daily Profit')
    linhas.push(`Período,${mes}`)
    linhas.push('')

    linhas.push('Resumo,Valor')
    linhas.push(`Lucro do negócio,${dados.negocio.lucro.toFixed(2)}`)
    linhas.push(`Pessoal líquido,${dados.pessoal.liquido.toFixed(2)}`)
    linhas.push(`Sobrou de verdade,${dados.sobrouDeVerdade.toFixed(2)}`)
    linhas.push('')

    linhas.push('Categoria,Entradas,Saídas,Saldo')
    Object.entries(dados.porCategoria).forEach(([cat, v]: any) => {
      const saldo = v.entrada - v.saida
      linhas.push(`${cat},${v.entrada.toFixed(2)},${v.saida.toFixed(2)},${saldo.toFixed(2)}`)
    })

    const csv = linhas.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-${mes.replace(/\s/g, '-')}.csv`
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