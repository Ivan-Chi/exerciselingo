import NavSidebar from "../components/NavSidebar";
import AppHeader from "../components/AppHeader";
import styles from "./page.module.css";
import { login, signup } from './action'

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <NavSidebar></NavSidebar>
      <div className={styles.hero}>
        <AppHeader></AppHeader>
        <div className={styles.formContainer}>
          <div className={styles.formDiv}>
            <form>
              <label htmlFor="email">Email:</label>
              <input id="email" name="email" type="email" required />
              <label htmlFor="password">Password:</label>
              <input id="password" name="password" type="password" required />
              <button formAction={login}>Log in</button>
            </form>
            <div className={styles.register}>
              <div>Not registered?             <a href="/register" className={styles.registerLink}>Sign up</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}