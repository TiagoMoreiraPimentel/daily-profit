'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ModalLimiteAtingido } from './paywall'

export function AssinarButton() {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <>
      <Button
        size="sm"
        onClick={() => setMostrarModal(true)}
        className="bg-amber-500 hover:bg-amber-600 text-white"
      >
        ⭐ Assinar Pro
      </Button>

      {mostrarModal && (
        <ModalLimiteAtingido onFechar={() => setMostrarModal(false)} />
      )}
    </>
  )
}