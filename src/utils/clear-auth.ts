// utils/auth-helper.ts
'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'

export const clearAuthData = async () => {
  const supabase = createClient()
  
  await supabase.auth.signOut()
  localStorage.removeItem('supabase.auth.token')
  redirect('/login')
}