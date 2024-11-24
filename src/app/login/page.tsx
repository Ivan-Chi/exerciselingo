import NavSidebar from "../components/NavSidebar";
import AppHeader from "../components/AppHeader";
import styles from "./page.module.css";

export default function Home() {
    return (
      <div className={styles.page}>
          <NavSidebar></NavSidebar>
          <AppHeader></AppHeader>
      </div>
    );
  }