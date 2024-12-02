import NavSidebar from "../components/NavSidebar";
import AppHeader from "../components/AppHeader";
import styles from "./page.module.css";
import { signup } from '../login/action'

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
              <button formAction={signup}>Sign Up</button>
            </form>
            <div className={styles.register}>
              <div>Already registered? <a href="/login" className={styles.registerLink}>Log In</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}