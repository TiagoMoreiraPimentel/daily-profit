'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function CadastroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nomeNegocio, setNomeNegocio] = useState('')
  const [tipo, setTipo] = useState('autonomo')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro(null)
    setSucesso(null)

    // Validação básica
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome_negocio: nomeNegocio,
          tipo: tipo,
        },
      },
    })

    if (error) {
      // Traduz erros comuns do Supabase para português
      if (error.message.includes('already registered')) {
        setErro('Este email já está cadastrado. Tente fazer login.')
      } else if (error.message.includes('invalid email')) {
        setErro('Email inválido. Verifique e tente novamente.')
      } else if (error.message.includes('password')) {
        setErro('Senha fraca. Use pelo menos 6 caracteres.')
      } else {
        setErro(`Erro ao criar conta: ${error.message}`)
      }
      setLoading(false)
      return
    }

    // Se o email precisa ser confirmado
    if (data.user && !data.session) {
      setSucesso(
        'Conta criada! Verifique seu email para confirmar o cadastro antes de fazer login.'
      )
      setLoading(false)
      return
    }

    // Se já tem sessão (email confirmado automaticamente)
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar conta no Daily Profit</CardTitle>
          <CardDescription>
            Comece a entender quanto você realmente lucra por dia
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleCadastro}>
          <CardContent className="space-y-4">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                ❌ {erro}
              </div>
            )}

            {sucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
                ✅ {sucesso}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nomeNegocio">Nome do seu negócio</Label>
              <Input
                id="nomeNegocio"
                value={nomeNegocio}
                onChange={(e) => setNomeNegocio(e.target.value)}
                placeholder="Ex: Barbearia do João"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50"
              >
                <option value="autonomo">Autônomo</option>
                <option value="mei">MEI</option>
                <option value="informal">Informal</option>
                <option value="outro">Outro</option>
              </select>
            </div>

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
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <p className="text-sm text-zinc-500 text-center">
              Já tem conta?{' '}
              <Link href="/login" className="text-zinc-900 font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}