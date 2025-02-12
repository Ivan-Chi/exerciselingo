import styles from "./page.module.css";
import { signup } from '../auth/action'
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className={styles.formContainer}>
      <div className={styles.formDiv}>
        <form>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
          <button formAction={signup}>Sign Up</button>
        </form>
        <div className={styles.register}>
          <div>
            Already registered? <Link href="/login" className={styles.registerLink}>Log In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}