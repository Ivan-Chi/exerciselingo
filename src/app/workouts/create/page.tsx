import ExerciseSelector from "@/app/components/ExerciseSelector";
import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from '@supabase/supabase-js';

export default async function CreateWorkout() {
    const supabase = await createClient();

    const { data: workout_exercises, error } = await supabase
    .from('workout_exercises')
    .select(`
        *,
        workout_id:workouts(
            *
        )
    `)
    .limit(4);

    if (error) {
        logError(error);
    }

    if (!workout_exercises || workout_exercises.length === 0) {
        const {data: baseExercises, error: baseExercisesError } = await supabase
        .rpc('get_random_exercises', {num_exercises: 4});

        if (baseExercisesError) {
            logError(baseExercisesError);
        }

        if (!baseExercises || baseExercises.length === 0) {
            logError(new Error('No base exercises found'));
        }

        return (
            <div>
                <ExerciseSelector exercises={baseExercises} />
            </div>
        );
    }

return (
    <div>
        <h1>Create Workout</h1>
        
        <ExerciseSelector exercises={workout_exercises} />
    </div>
    );
}

const logError = (error : PostgrestError | null | Error) => {
    console.log("Error: ", error);
    return (
        <div>
            Failed load
        </div>
    );
}