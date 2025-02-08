import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Database } from '@/../database.types';

type Tables = Database['public']['Tables'];
type WorkoutWithExercises = Tables['workouts']['Row'] & {
    workout_exercises: (
        Tables['workout_exercises']['Row'] & {
            exercise: Tables['exercises']['Row']
        }   
    )[]
}

type WorkoutExercise = Tables['workout_exercises']['Row'] & {
    exercise: Tables['exercises']['Row']
}   

type ExerciseGroups = {
    [key: number]: WorkoutExercise[];
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

export function updateTargetSets(workoutWithExercises: WorkoutWithExercises) {
    const exerciseGroups: ExerciseGroups = {};
    
    workoutWithExercises.workout_exercises.forEach(exercise => {
      if (!exerciseGroups[exercise.exercise_id]) {
        exerciseGroups[exercise.exercise_id] = [];
      }
      exerciseGroups[exercise.exercise_id].push(exercise);
    });
  
    Object.values(exerciseGroups).forEach(exercises => {
      exercises.forEach(exercise => {
        const actualReps = exercise.actual_reps ?? 0;
        const totalTargetReps = exercise.target_reps * exercise.target_sets;
        const totalActualReps = actualReps * exercise.target_sets; // Using target_sets since actual_sets is null
        const completionRate = totalActualReps / totalTargetReps;
  
        if (completionRate < 0.8) {
          exercise.target_reps = Math.max(1, Math.floor(exercise.target_reps - 1));
        } else if (completionRate >= 0.8 && completionRate < 0.9) {
          exercise.target_reps = Math.max(1, Math.floor(exercise.target_reps - 1));
        } else if (completionRate >= 1) {
          exercise.target_reps = Math.floor(exercise.target_reps + 1);
        }
      });
    });
  
    return workoutWithExercises;
  }