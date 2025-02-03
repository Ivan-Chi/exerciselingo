import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function workoutHistoryDetails({
  params
}: { 
  params: Promise<{workoutID: string}>
}) {
  const { workoutID } = await params;
  const supabase = await createClient();
  const {data: {user}, userError} = await supabase.auth.getUser();

  if(userError){
    console.log(userError);
  }

  if(!user || user===null){
    redirect('/login');
  }

  const { data: workout, error } = await supabase
  .from('workouts')
  .select(`
    id,
    created_at,
    profile_id,
    workout_exercises!inner (
      target_sets,
      target_reps,
      actual_sets,
      actual_reps,
      exercise_id,
      exercises (
        id,
        name,
        description
      )
    )
  `)
  .eq('profile_id',user.id)
  .eq('id',params.workoutID)

    console.log(JSON.stringify(workout));

  return(
    <div>
      <h1>Workout Details</h1>
      <div>{params.workoutID}</div>
    </div>
  )
}