import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-zinc-900">Daily Profit</h1>
        <p className="text-zinc-500 mt-4">
          Descubra quanto você realmente lucra por dia.
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link href="/cadastro">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
              Criar conta
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50"
            >
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}