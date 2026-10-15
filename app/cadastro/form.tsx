'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'

export function CadastroForm() {
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
      if (error.message.includes('already registered')) {
        setErro('Este email já está cadastrado. Tente fazer login.')
      } else if (error.message.includes('invalid email')) {
        setErro('Email inválido. Verifique e tente novamente.')
      } else {
        setErro(`Erro ao criar conta: ${error.message}`)
      }
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      setSucesso(
        'Conta criada! Verifique seu email para confirmar o cadastro antes de fazer login.'
      )
      setEmail('')
      setSenha('')
      setNomeNegocio('')
      setTipo('autonomo')
      setLoading(false)
      return
    }

    if (data.session) {
      setEmail('')
      setSenha('')
      setNomeNegocio('')
      setTipo('autonomo')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
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
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              ❌ {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg">
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
              className="flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
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
          <Button
            type="submit"
            variant="brand"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
          <p className="text-sm text-zinc-500 text-center">
            Já tem conta?{' '}
            <Link href="/login" className="text-emerald-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}