import styles from "./appHeader.module.css";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export default async function AppHeader() {
    const supabase = await createClient();
    const { data: {session}, error } = await supabase.auth.getSession();
    console.log(session);

    if (error) {
        redirect("/error");
    }

    if(!session) {
        return (
        <div className={styles.appHeader}>
            <h1>Title Placeholder</h1>
            <div className={styles.appHeaderButtons}>
                <a href="/register">Register</a>
                <a href="/login">Login</a>
            </div>
        </div>
        );
    }

    return (
        <div className={styles.appHeader}>
            <h1>Title Placeholder</h1>
            <div>Welcome {session.user.email}</div>
        </div>
    );
}