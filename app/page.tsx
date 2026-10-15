import { Suspense } from 'react'
import { connection } from 'next/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { WhatsAppButton } from '@/components/whatsapp-button'

async function HomeContent() {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const logado = !!user

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900">
            Daily Profit
          </Link>
          <div className="flex items-center gap-3">
            {logado ? (
              <Link href="/dashboard">
                <Button size="sm" variant="brand">Ir para o dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-zinc-600 hover:text-zinc-900 font-medium"
                >
                  Entrar
                </Link>
                <Link href="/cadastro">
                  <Button size="sm" variant="brand">Criar conta grátis</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="text-sm font-medium text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full mb-6">
          Grátis para começar · Sem cartão de crédito
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight tracking-tight">
          Você sabe quanto lucrou <span className="text-emerald-600">hoje</span>?
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 mt-6 max-w-2xl mx-auto">
          O Daily Profit mostra em 5 segundos quanto entrou, quanto saiu e
          quanto <strong>sobrou de verdade</strong>. Separe o que é do negócio
          do que é pessoal — sem planilha, sem complicação.
        </p>
        <div className="mt-10 flex gap-3 justify-center flex-wrap">
          <Link href={logado ? '/dashboard' : '/cadastro'}>
            <Button size="lg" variant="brand">
              {logado ? 'Ir para o dashboard' : 'Começar grátis agora'}
            </Button>
          </Link>
          {!logado && (
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-4">
          Usado por autônomos, MEIs e pequenos negócios
        </p>
      </section>

      {/* PROBLEMA */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6 tracking-tight">
            Você trabalha o dia todo, mas no fim do mês...
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            ...não sabe se realmente lucrou ou só girou dinheiro.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
              <div className="text-2xl mb-3">😵‍💫</div>
              <p className="text-zinc-700 text-sm">
                A conta bancária mostra o saldo, mas não diz se o dia foi bom
                ou ruim.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
              <div className="text-2xl mb-3">📋</div>
              <p className="text-zinc-700 text-sm">
                Planilhas são chatas de manter e você abandona em uma semana.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
              <div className="text-2xl mb-3">🤔</div>
              <p className="text-zinc-700 text-sm">
                Você mistura dinheiro pessoal com o do negócio e não sabe
                quanto sobra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
              O Daily Profit resolve isso
            </h2>
            <p className="text-lg text-zinc-600">
              Registre em 5 segundos. Veja o lucro na hora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-4">
                💰
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">
                Lucro do dia
              </h3>
              <p className="text-sm text-zinc-600">
                Quanto entrou, quanto saiu e quanto sobrou — em uma tela só.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mx-auto mb-4">
                🔀
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">
                Pessoal vs. negócio
              </h3>
              <p className="text-sm text-zinc-600">
                Marque o que é pessoal e veja o lucro do negócio sem confusão.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-2xl mx-auto mb-4">
                📅
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">
                Histórico completo
              </h3>
              <p className="text-sm text-zinc-600">
                Navegue por qualquer dia, edite, exclua e veja a evolução.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO NOVA — CARTEIRAS */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full mb-4">
              Novo
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
              Onde está seu dinheiro?
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Você tem dinheiro no banco, no Mercado Pago, na carteira... e às
              vezes não sabe quanto tem no total.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Cards exemplo */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
                Suas carteiras
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                      🏦
                    </div>
                    <span className="text-sm font-medium text-zinc-900">Itaú</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    R$ 2.350,00
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm">
                      📱
                    </div>
                    <span className="text-sm font-medium text-zinc-900">Nubank</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    R$ 890,00
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
                      💵
                    </div>
                    <span className="text-sm font-medium text-zinc-900">Dinheiro</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    R$ 200,00
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-900">
                  Total
                </span>
                <span className="text-lg font-bold text-zinc-900 tracking-tight">
                  R$ 3.440,00
                </span>
              </div>
            </div>

            {/* Explicação */}
            <div>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900 mb-1">
                      Cadastre seus bancos e contas
                    </p>
                    <p className="text-sm text-zinc-600">
                      Itaú, Nubank, Mercado Pago, dinheiro em espécie... cada um
                      como uma carteira.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900 mb-1">
                      Registre de onde o dinheiro saiu
                    </p>
                    <p className="text-sm text-zinc-600">
                      Cada entrada ou saída pode ser ligada a uma carteira
                      específica.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900 mb-1">
                      Veja o saldo real de cada uma
                    </p>
                    <p className="text-sm text-zinc-600">
                      O app calcula automaticamente quanto ainda tem em cada
                      conta, em tempo real.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-900 mb-1">
                      Categorias do seu jeito
                    </p>
                    <p className="text-sm text-zinc-600">
                      Personalize as categorias de entrada e saída conforme o
                      seu nicho.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 text-center mb-12 tracking-tight">
            Como funciona
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Registre em 5 segundos
                </h3>
                <p className="text-sm text-zinc-600">
                  Toque no botão verde (+), digite o valor e pronto. Sem
                  formulário longo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Veja o lucro na hora
                </h3>
                <p className="text-sm text-zinc-600">
                  Os cards atualizam automaticamente. Sem recarregar a página.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Separe pessoal e negócio
                </h3>
                <p className="text-sm text-zinc-600">
                  Marque o que é pessoal e veja o lucro real do negócio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES PRO */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
              Quer ir além? Conheça o Pro
            </h2>
            <p className="text-lg text-zinc-600">
              Ferramentas que mostram para onde seu negócio está indo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-zinc-900 mb-2">
                Previsão de caixa
              </h3>
              <p className="text-sm text-zinc-600">
                Saiba quanto deve entrar e sair no próximo mês, com base no
                seu histórico.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-semibold text-zinc-900 mb-2">
                Relatório mensal
              </h3>
              <p className="text-sm text-zinc-600">
                Veja tudo que aconteceu no mês, por categoria. Exporte em CSV.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-zinc-900 mb-2">
                Gráfico de evolução
              </h3>
              <p className="text-sm text-zinc-600">
                Acompanhe a evolução do seu lucro nos últimos 6 meses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
              Planos simples, sem surpresa
            </h2>
            <p className="text-lg text-zinc-600">
              Comece grátis. Faça upgrade quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                Free
              </p>
              <p className="text-3xl font-bold text-zinc-900 mb-1 tracking-tight">
                R$ 0
              </p>
              <p className="text-xs text-zinc-500 mb-6">para sempre</p>

              <ul className="space-y-2 text-sm text-zinc-700 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> 30 transações por mês
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Lucro do dia
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Separação pessoal/negócio
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Carteiras ilimitadas
                </li>
              </ul>

              <Link href={logado ? '/dashboard' : '/cadastro'}>
                <Button variant="outline" className="w-full">
                  Começar grátis
                </Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Recomendado
              </span>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                Pro
              </p>
              <p className="text-3xl font-bold text-zinc-900 mb-1 tracking-tight">
                R$ 19,90
              </p>
              <p className="text-xs text-zinc-500 mb-6">por mês</p>

              <ul className="space-y-2 text-sm text-zinc-700 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Tudo do Free
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Transações ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Previsão de caixa
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Relatório mensal (CSV)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Gráfico de evolução
                </li>
              </ul>

              <Link href={logado ? '/dashboard' : '/cadastro'}>
                <Button variant="brand" className="w-full">
                  Começar grátis
                </Button>
              </Link>
              <p className="text-xs text-zinc-400 text-center mt-3">
                Faça upgrade quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
            Pare de adivinhar. Comece a saber.
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            Crie sua conta grátis em 30 segundos. Sem cartão de crédito.
          </p>
          <Link href={logado ? '/dashboard' : '/cadastro'}>
            <Button size="lg" variant="brand">
              {logado ? 'Ir para o dashboard' : 'Criar conta grátis'}
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-zinc-500">
            Daily Profit © {new Date().getFullYear()} — feito para
            autônomos e MEIs brasileiros.
          </p>
          <div className="mt-4 flex gap-4 justify-center text-sm">
            <Link href="/termos" className="text-zinc-500 hover:text-zinc-900">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="text-zinc-500 hover:text-zinc-900">
              Privacidade
            </Link>
            <a
              href="mailto:contato@dailyprofit.com.br"
              className="text-zinc-500 hover:text-zinc-900"
            >
              Contato
            </a>
          </div>
        </div>
      </footer>

      {/* WhatsApp flutuante — landing usa local="rodape" */}
      <WhatsAppButton posicao="esquerda" tamanho="grande" local="rodape" />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-zinc-500">Carregando...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}