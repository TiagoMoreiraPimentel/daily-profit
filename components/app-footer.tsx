import Link from 'next/link'

export function AppFooter() {
  return (
    <footer className="border-t border-zinc-100 mt-12 pt-6 pb-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex gap-4 justify-center text-xs text-zinc-500 flex-wrap">
          <Link href="/termos" className="hover:text-zinc-900 transition">
            Termos de uso
          </Link>
          <span>·</span>
          <Link href="/privacidade" className="hover:text-zinc-900 transition">
            Privacidade
          </Link>
          <span>·</span>
          <a
            href="https://wa.me/5511992233306?text=Ol%C3%A1!%20Estou%20usando%20o%20Daily%20Profit%20e%20preciso%20de%20ajuda."
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 transition"
          >
            Suporte
          </a>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          Daily Profit © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}