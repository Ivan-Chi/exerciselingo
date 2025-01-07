import Image from "next/image";
import styles from "./page.module.css";
import AppHeader from "./components/AppHeader";
import NavSidebar from "./components/NavSidebar";
import { createClient } from "../utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    return (
      <div className={styles.page}>
        <NavSidebar></NavSidebar>
        <div className={styles.hero}> 
          <AppHeader></AppHeader>
          <div>
          <h1>Exercise Lingo</h1>
            <div className={styles.heroDescription}>
              <div className={styles.heroDescriptionText}>
                <p>A language for working out. Exercise Lingo provides an exercise a day to get you moving!</p>
                <button>Get Started</button>
              </div>
              <Image src="/hero.jpg" alt="Hero Image" height={500} width={500} className={styles.heroImage}></Image> 
            </div>
          </div>
        </div>
      </div>
    );
  }
  else{
    return (
      <div className={styles.page}>
        <NavSidebar></NavSidebar>
        <div className={styles.hero}> 
          <AppHeader></AppHeader>
          <div>
            <div className="exercise">
              <h1>Choose Your Exercise</h1>
              {/* TODO: Exercise Component */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
