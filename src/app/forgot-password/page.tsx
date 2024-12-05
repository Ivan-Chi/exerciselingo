import NavSidebar from "../components/NavSidebar";
import AppHeader from "../components/AppHeader";
import styles from "./page.module.css";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ProfilePage() {
  return (
    <div className={styles.page}>
      <NavSidebar></NavSidebar>
      <div className={styles.hero}>
        <AppHeader></AppHeader>
        <div className={styles.content}>
            <ResetPasswordForm></ResetPasswordForm>
        </div>
      </div>
    </div>
  )
}