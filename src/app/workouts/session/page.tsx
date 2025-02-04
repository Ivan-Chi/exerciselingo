// WorkoutSession.tsx (Server Component)
import { createClient } from "@/utils/supabase/server";
import WorkoutSessionClient from '@/app/components/WorkoutExerciseClient'; // The client component


export default async function WorkoutSession() {
    // Create Supabase client on the server
    const supabase = await createClient();
   
    // Fetch the most recent workout with its exercises
    const { data: workout, error } = await supabase
        .from('workouts')
        .select(`
            id,
            created_at,
            workout_exercises!inner (
                target_sets,
                target_reps,
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
        return <div>Error loading workout</div>;
    }

    if (!workout || workout === null) {
        return (
            <div>
                <h1>Workout Session</h1>
                <div>No workout found</div>
            </div>
        );
    }

    return (
        <WorkoutSessionClient initialWorkout={workout} />
    );
}