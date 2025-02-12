import styles from "./appHeader.module.css";
import { createClient } from "../../utils/supabase/server";

export default async function AppHeader() {
    const supabase = await createClient();
    const { data: {user} } = await supabase.auth.getUser();

    if(!user) {
        return (
        <div className={styles.appHeader}>
            <h1>ExerciseLingo</h1>
            <div className={styles.appHeaderButtons}>
                <a href="/register">Register</a>
                <a href="/login">Login</a>
            </div>
        </div>
        );
    }

    return (
        <div className={styles.appHeader}>
            <h1>ExerciseLingo</h1>
            <div>Welcome {user.email}</div>
        </div>
    );
}