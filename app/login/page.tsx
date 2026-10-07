'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErro('Seu email ainda não foi confirmado. Verifique sua caixa de entrada (e o spam).')
      } else if (error.message.includes('Invalid login credentials')) {
        setErro('Email ou senha incorretos. Verifique e tente novamente.')
      } else if (error.message.includes('Too many requests')) {
        setErro('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      } else {
        setErro(`Erro ao entrar: ${error.message}`)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar no Daily Profit</CardTitle>
          <CardDescription>Acesse sua conta</CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                ❌ {erro}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Link
              href="/esqueci-senha"
              className="text-sm text-zinc-500 hover:text-zinc-900 hover:underline"
            >
              Esqueci minha senha
            </Link>

            <p className="text-sm text-zinc-500 text-center">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-zinc-900 font-medium hover:underline">
                Criar conta
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}