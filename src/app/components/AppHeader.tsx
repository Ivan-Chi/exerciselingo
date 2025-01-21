import styles from "./appHeader.module.css";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export default async function AppHeader() {
    const supabase = await createClient();
    const { data: {user}, error } = await supabase.auth.getUser();

    if (error) {
        redirect("/error");
    }

    if(!user) {
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
            <div>Welcome {user.email}</div>
        </div>
    );
}