'use client'

import { useState } from 'react'
import { login } from '../auth/action'
import styles from './page.module.css'
import Link from 'next/link'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className={styles.formDiv}>
      <form action={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <button type="submit">Log in</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <div className={styles.register}>
        <div>
            Not registered? <Link href="/register" className={styles.registerLink}>Sign up</Link>
        </div>
      </div>
      <div className={styles.register}>
        Forgot Password? <Link href="/forgot-password" className={styles.registerLink}>Reset</Link>
      </div>
    </div>
  )
}