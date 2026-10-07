import { resend } from './resend'

export async function enviarBoasVindas({
  para,
  nome,
  nomeNegocio,
}: {
  para: string
  nome: string
  nomeNegocio: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Daily Profit <onboarding@resend.dev>', // Troque quando tiver domínio
      to: [para],
      subject: 'Bem-vindo ao Daily Profit 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #18181b;">Olá, ${nome}! 👋</h1>
          <p style="color: #52525b; font-size: 16px;">
            Bem-vindo ao <strong>Daily Profit</strong>, ${nomeNegocio}!
          </p>
          <p style="color: #52525b; font-size: 16px;">
            Agora você pode registrar suas entradas e saídas e descobrir
            <strong>quanto realmente lucra por dia</strong>, separando o que é
            do negócio do que é pessoal.
          </p>
          <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #18181b; font-size: 14px; margin: 0;">
              💡 <strong>Dica:</strong> comece registrando as transações de hoje.
              Em 5 segundos você já vê o lucro do dia.
            </p>
          </div>
          <a href="https://daily-profit-theta.vercel.app/dashboard"
             style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Acessar meu dashboard
          </a>
          <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px;">
            Daily Profit — entenda seu lucro de verdade.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('❌ Erro ao enviar e-mail de boas-vindas:', error)
      return { sucesso: false, error }
    }

    console.log('✅ E-mail de boas-vindas enviado:', data?.id)
    return { sucesso: true, data }
  } catch (e) {
    console.error('❌ Erro inesperado ao enviar e-mail:', e)
    return { sucesso: false, error: e }
  }
}