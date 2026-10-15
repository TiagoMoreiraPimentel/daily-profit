'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      {loading ? 'Saindo...' : 'Sair'}
    </Button>
  )
}