// components/InitializeApp.tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { clearAuthData } from '@/utils/clear-auth'

export default function InitializeApp({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient()
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'TOKEN_REFRESHED' && !session) || event === 'SIGNED_OUT') {
        await clearAuthData()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <>{children}</>
}