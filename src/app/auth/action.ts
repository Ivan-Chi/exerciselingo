'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  const { error } = await supabase.auth.signInWithPassword(data)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.log(error);
    redirect('/')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error);
    redirect('/')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: 'http://localhost:3000/reset-password',
  })
  
  if (error) {
    return { error: error.message }
  }
  
  // Return a success message instead of redirecting
  return { message: 'Password reset email sent successfully' }
}