import ExerciseSelector from "@/app/components/ExerciseSelector";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from '@supabase/supabase-js';
import { Database } from "@/../database.types";
import styles from "./page.module.css";

type Tables = Database['public']['Tables'];

type Workout = Tables['workouts']['Row'];
type Exercises = Tables['exercises']['Row'];
type ExerciseWithHistory = {
    workout_id: Workout;
    exercise_id: Exercises,
    order_in_workout: number;
    target_sets: number;
    target_reps: number;
    target_weight?: number;
    actual_sets?: number;
    actual_reps?: number,
    actual_weight?: number,
    completed_at?: Date;
}

export default async function CreateWorkout() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()

    const {data: baseExercises, error: baseExercisesError } = await supabase
    .rpc('get_random_exercises', {num_exercises: 4});
    
    const exerciseWithHistory = [];

    for (const exercise of baseExercises){
        // for each exercise, fetch the last workout used with this exercise
        const { data: lastWorkoutWithExercise } = await supabase
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
        .eq('workouts.profile_id', user?.id)
        .order('workout_id', { ascending: false })
        .not('completed_at', 'is', null)
        .limit(1)
        .single();
    
        // FIXME: add logic to fallback to create the exercise with the defaults.
        if(!lastWorkoutWithExercise){
            const  workoutWithExercise = createWorkoutWithExercises(exercise, user?.id);
            exerciseWithHistory.push(workoutWithExercise);
        }
        else{
            exerciseWithHistory.push(lastWorkoutWithExercise);
        }
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

function createWorkoutWithExercises( exercise: Exercises, userID?: string){
    const workoutWithExercise: ExerciseWithHistory = {
        workout_id: {
            completed_at: null,
            created_at: null,
            date: null,
            description: null,
            id: -1,
            profile_id: userID || null,
        }, 
        exercise_id: exercise,
        order_in_workout: -1, // This will be set when adding to workout
        target_sets: exercise.base_frequency || 3, // Default to 3 if base_frequency not set
        // TODO: Update exercise schema for target_frequency
        target_reps: 3,
        target_weight: undefined,
        actual_sets: undefined,
        actual_reps: undefined,
        actual_weight: undefined,
        completed_at: undefined,
    };
    
    return workoutWithExercise;
}