'use client'

import { signOut } from 'next-auth/react'
import React from 'react'

export function LogoutButton({ className }: { className?: string }) {
  const onClick = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (e) {
      console.error('[UI] signOut error', e)
    }
  }
  return (
    <button
      type="button"
      className={
        className ?? 'font-medium text-muted-foreground hover:text-foreground'
      }
      onClick={onClick}
    >
      Logout
    </button>
  )
}

export default LogoutButton
