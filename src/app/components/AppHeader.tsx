import styles from "./appHeader.module.css";

export default function AppHeader() {

    return (
        <div className={styles.appHeader}>
            <h1>Title Placeholder</h1>
            <div className={styles.appHeaderButtons}>
                <button>Register</button>
                <button>Login</button>
            </div>
        </div>
    );
}