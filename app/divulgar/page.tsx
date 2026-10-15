import Link from 'next/link'

export const metadata = {
  title: 'Divulgar — Daily Profit',
}

export default function DivulgarPage() {
  return (
    <div className="min-h-screen bg-zinc-900 p-4 md:p-8">
      {/* Aviso topo */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <p className="text-xs text-zinc-500">
          💡 Abra esta página no navegador, ajuste o zoom para 100%, e tire um
          print (ou use uma extensão de "print full page") do banner abaixo.
          <br />
          Formato ideal: <strong className="text-zinc-300">1080 × 1920</strong> (Status/Stories).
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline"
        >
          ← Voltar ao app
        </Link>
      </div>

      {/* Banner 9:16 */}
      <div className="flex justify-center">
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            width: '100%',
            maxWidth: '405px', // ~= 1080/2.666 (escala)
            aspectRatio: '9 / 16',
            background:
              'linear-gradient(160deg, #09090b 0%, #064e3b 60%, #10b981 130%)',
          }}
        >
          {/* Padrão sutil de fundo */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Glow superior */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />

          {/* Conteúdo */}
          <div className="relative h-full flex flex-col justify-between p-8 text-white">
            {/* Topo: logo */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold tracking-tight">
                Daily Profit
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-300">
                100% grátis
              </span>
            </div>

            {/* Meio: mensagem principal */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300 mb-4">
                  Você sabe quanto
                  <br />
                  lucrou hoje?
                </p>

                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight">
                  Descubra seu
                  <br />
                  <span className="text-emerald-400">lucro real</span>,
                  <br />
                  dia a dia.
                </h1>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-[280px]">
                Registre entradas e saídas em 5 segundos. Separe o que é do
                negócio do que é pessoal. Veja quanto sobrou de verdade.
              </p>

              {/* Bullets */}
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                    ✓
                  </span>
                  <span className="text-zinc-200">Grátis para começar</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                    ✓
                  </span>
                  <span className="text-zinc-200">Sem cartão de crédito</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                    ✓
                  </span>
                  <span className="text-zinc-200">
                    Funciona no celular e no PC
                  </span>
                </li>
              </ul>
            </div>

            {/* Rodapé: CTA */}
            <div className="space-y-4">
              <div className="bg-white text-zinc-900 rounded-2xl py-4 px-6 text-center">
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1">
                  Acesse agora
                </p>
                <p className="text-base font-bold tracking-tight">
                  dailyprofit.com.br
                </p>
              </div>

              <p className="text-[10px] text-center text-zinc-400">
                Feito para autônomos, MEIs e pequenos negócios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda sugerida */}
      <div className="max-w-2xl mx-auto mt-12 bg-zinc-800/60 border border-zinc-700 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
          💬 Legenda sugerida para o WhatsApp
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {`Oi! Tudo bem?

Criei uma ferramenta pra ajudar autônomos e pequenos negócios a saberem quanto realmente lucram por dia (separando o que é pessoal do que é do trabalho).

É grátis pra começar e leva 5 segundos pra registrar uma entrada ou saída.

Dá uma olhada: dailyprofit.com.br

Se gostar, me conta! 🙂`}
        </p>
      </div>
    </div>
  )
}