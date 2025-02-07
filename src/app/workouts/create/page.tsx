import ExerciseSelector from "@/app/components/ExerciseSelector";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from '@supabase/supabase-js';

export default async function CreateWorkout() {
    const supabase = await createClient();

    const {data: baseExercises, error: baseExercisesError } = await supabase
    .rpc('get_random_exercises', {num_exercises: 4});
    
    const exerciseWithHistory = [];

    for (const exercise of baseExercises){
        // for each exercise, fetch the last workout used with this exercise
        const { data: lastWorkoutWithExercise, error } = await supabase
        .from('workout_exercises')
        .select(`
            *,
            workout_id:workouts(
                *
            ),
            exercise_id:exercises(
                *
            )
        `)
        .eq('exercise_id', exercise.id)
        .order('workout_id', { ascending: false })
        .not('completed_at', 'is', null)
        .limit(1)
        .single();
    
        if (error) throw error;

        exerciseWithHistory.push(lastWorkoutWithExercise);
    }

    if (exerciseWithHistory.length !== 0) {


        if (baseExercisesError) {
            logError(baseExercisesError);
        }

        if (!baseExercises || baseExercises.length === 0) {
            logError(new Error('No base exercises found'));
        }

        return (
            <div>
                <ExerciseSelector exercises={exerciseWithHistory} />
            </div>
        );
    }

    return (
        <div> No exercises found </div>
    )
}

const logError = (error : PostgrestError | null | Error) => {
    console.log("Error: ", error);
    return (
        <div>
            Failed load
        </div>
    );
}