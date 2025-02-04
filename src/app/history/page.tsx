import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function History(){
  const supabase = await createClient();

  const {data: {user}} = await supabase.auth.getUser();
  if (!user || user===null) {
    redirect('/login');
  }

  const { data: workout, error } = await supabase
  .from('workouts')
  .select(`
    *
  `)
  .not('completed_at', 'is', null)
  .eq('profile_id',user.id)
  .order('created_at', { ascending: false })
  .limit(10);

  if (error) {
    console.log(error);
  }

  if (!workout || workout===null){
    return(
      <div>
        <h1>History</h1>
        <div>No workout found</div>
      </div>
    )
  }

  return(
    <div>
      <h1>History</h1>
      {workout.map(workout => (
        <Link key={workout.id} href={`/history/${workout.id}`}>
          <div>{workout.date}</div>
          <div>{workout.completed_at}</div>
        </Link>
      ))}
    </div>
  )
}