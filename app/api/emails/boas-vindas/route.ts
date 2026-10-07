import { NextResponse } from 'next/server'
import { enviarBoasVindas } from '@/lib/emails'

export async function POST(request: Request) {
  try {
    const { email, nome, nomeNegocio } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })
    }

    const resultado = await enviarBoasVindas({
      para: email,
      nome: nome || 'usuário',
      nomeNegocio: nomeNegocio || 'seu negócio',
    })

    if (!resultado.sucesso) {
      return NextResponse.json({ error: 'Erro ao enviar e-mail' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro no endpoint de boas-vindas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}