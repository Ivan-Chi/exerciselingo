import Image from "next/image";
import styles from "./page.module.css";
import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient();

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    return (
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
    )
  }
  else{
    redirect('/workouts/create')
  }
}
