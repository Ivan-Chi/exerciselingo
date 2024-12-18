import NavSidebar from "../components/NavSidebar";
import AppHeader from "../components/AppHeader";
import styles from "./page.module.css";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <NavSidebar></NavSidebar>
      <div className={styles.hero}>
        <AppHeader></AppHeader>
        <div className={styles.formContainer}>
          <div className={styles.formDiv}>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}