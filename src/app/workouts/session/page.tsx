import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function WorkoutSession() {
    const supabase = await createClient();
    // const { data: {user} } = await supabase.auth.getUser();

    // if (!user || user===null) {
    //     redirect('/login');
    // }
    
    // FIXME: fix the below query. something about workout_exercises is busted.
    const { data: workout, error } = await supabase
    .from('workouts')
    .select(`
      id,
      created_at,
      workout_exercises!inner (
        exercise_id,
        exercises (
          id,
          name,
          description
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

    if (error) {
        console.log(error);
    }

    // console.log(JSON.stringify(workout));

    console.log('Full workout:', workout);
    console.log('Workout exercises:', workout?.workout_exercises);

    if (!workout || workout.length === 0) {
        return(
            <div>
                <h1>Workout Session</h1>
                <div>No workout found</div>
            </div>
        )
    }

    return(
        <div>
            <h1>Workout Session</h1>
            {workout.workout_exercises.map(exercise => (
                <div key={exercise.exercise_id}>
                    <div>{exercise.exercises.name}</div>
                    <div>{exercise.exercises.description}</div>
                </div>
            ))}
        </div>
    )
}