'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Link from 'next/link'
import { resetPassword } from '../auth/action'

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    const result = await resetPassword(formData)
    
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className={styles.formDiv}>
        <form action={handleSubmit}>
            <input type="email" name="email" placeholder="Email" required />
            <button type="submit">Reset Password</button>
        </form>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <div className={styles.register}>
        <div>
            Not registered? <Link href="/register" className={styles.registerLink}>Sign up</Link>
        </div>
      </div>
    </div>
  )
}