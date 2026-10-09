import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Daily Profit',
  description: 'Como o Daily Profit trata seus dados.',
}

export default function PrivacidadePage() {
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
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Política de Privacidade
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Última atualização: 09/10/2026
        </p>

        <div className="prose prose-zinc max-w-none space-y-6 text-zinc-700">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Em construção.</strong> Este documento está sendo
              elaborado para conformidade com a LGPD.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              1. Quais dados coletamos
            </h2>
            <p className="text-sm">
              Coletamos apenas os dados necessários para o funcionamento do
              serviço: e-mail, nome, nome do negócio e as transações financeiras
              que você registra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              2. Como usamos seus dados
            </h2>
            <p className="text-sm">
              Seus dados são usados exclusivamente para exibir seus relatórios
              financeiros e para o funcionamento da sua conta. Não vendemos nem
              compartilhamos seus dados com terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              3. Onde os dados ficam armazenados
            </h2>
            <p className="text-sm">
              Seus dados são armazenados de forma segura no Supabase, com
              isolamento por conta. Ninguém além de você acessa suas
              informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              4. Seus direitos (LGPD)
            </h2>
            <p className="text-sm">
              Você pode solicitar a exclusão da sua conta e de todos os seus
              dados a qualquer momento. Basta entrar em contato.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              5. Contato
            </h2>
            <p className="text-sm">
              Dúvidas sobre privacidade? Fale conosco:{' '}
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