'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  // Verifica se o usuário tem sessão de recuperação válida
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // OK, usuário está no fluxo de recuperação
      }
    })
  }, [supabase])

  async function handleAtualizar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      setErro('Link inválido ou expirado. Solicite um novo link de recuperação.')
      setLoading(false)
      return
    }

    setSucesso(true)
    setLoading(false)

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Definir nova senha</CardTitle>
          <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
        </CardHeader>

        <form onSubmit={handleAtualizar}>
          <CardContent className="space-y-4">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                ❌ {erro}
              </div>
            )}

            {sucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
                ✅ Senha atualizada! Redirecionando para o login...
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading || sucesso}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar">Confirmar nova senha</Label>
              <Input
                id="confirmar"
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                disabled={loading || sucesso}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || sucesso}>
              {loading ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}