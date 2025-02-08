import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Database } from '@/../database.types';
import { updateTargetSets } from '@/utils/updateTargetSets';

type Tables = Database['public']['Tables'];

type WorkoutExercise = Tables['workout_exercises']['Row'] & {
    exercise: Tables['exercises']['Row']
}   

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
       
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workoutWithExercises = body.workout;
        updateTargetSets(workoutWithExercises);

        // update workout_exercises
        await Promise.all(
            workoutWithExercises.workout_exercises.map(async (exercise: WorkoutExercise) => {
              const { error: workoutExerciseUpdateError } = await supabase
                .from('workout_exercises')
                .update({
                  target_reps: exercise.target_reps,
                  target_sets: exercise.target_sets,
                  completed_at: new Date().toISOString(),
                  actual_reps: exercise.actual_reps
                })
                .eq('workout_id', workoutWithExercises.id)
                .eq('exercise_id', exercise.exercise_id)
                .eq('order_in_workout', exercise.order_in_workout);
              if (workoutExerciseUpdateError) {
                throw workoutExerciseUpdateError;
              }
            })
          );

        // update workouts
        const { error: workoutUpdateError } = await supabase
        .from('workouts')
        .update({
            completed_at: new Date().toISOString(),
        })
        .eq('id',workoutWithExercises.id);

        if (workoutUpdateError) { throw workoutUpdateError };

        return NextResponse.json(workoutWithExercises);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
    }
}

