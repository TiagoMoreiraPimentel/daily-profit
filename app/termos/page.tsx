import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso — Daily Profit',
  description: 'Termos de uso do Daily Profit.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900">
            Daily Profit
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 font-medium"
          >
            ← Voltar
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Última atualização: 09/10/2026
        </p>

        <div className="prose prose-zinc max-w-none space-y-6 text-zinc-700">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Em construção.</strong> Este documento está sendo
              elaborado. Enquanto isso, em caso de dúvidas, entre em contato
              pelo WhatsApp.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              1. Sobre o Daily Profit
            </h2>
            <p className="text-sm">
              O Daily Profit é uma ferramenta para autônomos e pequenos negócios
              registrarem entradas e saídas e acompanharem o lucro diário. O
              serviço é oferecido nos planos Free e Pro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              2. Uso do serviço
            </h2>
            <p className="text-sm">
              O usuário é responsável pelas informações registradas na
              plataforma. O Daily Profit não se responsabiliza por decisões
              financeiras tomadas com base nos dados exibidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              3. Conta e pagamento
            </h2>
            <p className="text-sm">
              A assinatura do plano Pro é cobrada mensalmente via Mercado Pago.
              O cancelamento pode ser feito a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              4. Contato
            </h2>
            <p className="text-sm">
              Dúvidas? Fale conosco:{' '}
              <a
                href="https://wa.me/5511992233306"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                WhatsApp
              </a>{' '}
              ou{' '}
              <a
                href="mailto:contato@dailyprofit.com.br"
                className="text-green-700 hover:underline"
              >
                contato@dailyprofit.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}