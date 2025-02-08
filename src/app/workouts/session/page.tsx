import { createClient } from "@/utils/supabase/server";
import WorkoutSessionClient from '@/app/components/WorkoutExerciseClient';
import { Database } from "@/../database.types"

type Tables = Database['public']['Tables'];
type WorkoutWithExercises = Tables['workouts']['Row'] & {
    workout_exercises: (
        Database['public']['Tables']['workout_exercises']['Row'] & {
            exercise: Database['public']['Tables']['exercises']['Row']
        }   
    )[]
}

export default async function WorkoutSession() {
    const workout:WorkoutWithExercises = await getWorkout();

    if (!workout) {
        return (
            <div>
                <h1>Workout Session</h1>
                <div>No workout found</div>
            </div>
        );
    }
    
    return (
        <WorkoutSessionClient workoutWithExercises={workout} />
    );
}

async function getWorkout(){
    const supabase = await createClient();

    const { data: workout, error } = await supabase
    .from('workouts')
    .select(`
        *,
        workout_exercises!workout_id (
            *,
            exercise:exercise_id (
                *
            )
        )
    `)
    .order('created_at', { ascending: false })
    .is('completed_at', null)
    .limit(1)
    .single();

    if (error) { throw error }

    return workout;
}