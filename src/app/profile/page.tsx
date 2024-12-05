import NavSidebar from "../components/NavSidebar";
import AppHeader from "../components/AppHeader";
import styles from "./page.module.css";
import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "../auth/action";

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
        redirect('/login');
    }   

  return (
    <div className={styles.page}>
      <NavSidebar></NavSidebar>
      <div className={styles.hero}>
        <AppHeader></AppHeader>
        <div className={styles.content}>
            <form action={logout}>
                <button type="submit">Logout</button>
            </form>
        </div>
      </div>
    </div>
  )
}