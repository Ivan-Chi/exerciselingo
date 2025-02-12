import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Database } from '@/../database.types';
import Link from "next/link";

type Tables = Database['public']['Tables'];

type WorkoutDetails = {
    id: Tables['workouts']['Row']['id'];
    created_at: Tables['workouts']['Row']['created_at'];
    profile_id: Tables['workouts']['Row']['profile_id'];
    workout_exercises: {
        target_sets: Tables['workout_exercises']['Row']['target_sets'];
        target_reps: Tables['workout_exercises']['Row']['target_reps'];
        actual_sets: Tables['workout_exercises']['Row']['actual_sets'];
        actual_reps: Tables['workout_exercises']['Row']['actual_reps'];
        exercise_id: Tables['workout_exercises']['Row']['exercise_id'];
        exercises: Pick<Tables['exercises']['Row'], 'id' | 'name' | 'description'>;
    }[];
};

export default async function WorkoutHistoryDetails({
    params: paramsPromise
}: {
    params: Promise<{ workoutID: string }>;
}) {
    const params = await paramsPromise;
    const { workoutID } = params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
   
    if (userError) {
        console.log(userError);
    }
    if (!user) {
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
        .eq('profile_id', user.id)
        .eq('id', workoutID)
        .single();

    if (error) {
        console.error('Error fetching workout:', error);
        return <div>Error loading workout details</div>;
    }

    const typedWorkout = (workout as unknown) as WorkoutDetails;
    
    return (
        <div>
            <Link href="/history">Back</Link>
            <h1>Workout Details</h1>
            <div>Workout Started At: {typedWorkout.created_at}</div>
            <div>
                <h2>Exercises:</h2>
                {typedWorkout.workout_exercises.map((workout_exercise)=>{
                    return(
                        <div>
                            <h3>{workout_exercise.exercises.name}</h3>
                            Target Reps: {workout_exercise.target_reps} <br></br>
                            Target Sets: {workout_exercise.target_sets}<br></br>
                            {workout_exercise.actual_reps ? `Actual Reps: ${workout_exercise.actual_reps}` : ''}<br></br>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}