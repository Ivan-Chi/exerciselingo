import styles from "./page.module.css";
import { LoginForm } from "./LoginForm";
import {createClient} from "../../utils/supabase/server"
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session?.user) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.formDiv}>
          <LoginForm />
        </div>
      </div>
    );
  }

  else {
    redirect('/');
  }
}