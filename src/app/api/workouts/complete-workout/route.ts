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
    
    // Group exercises
    workoutWithExercises.workout_exercises.forEach(exercise => {
      if (!exerciseGroups[exercise.exercise_id]) {
        exerciseGroups[exercise.exercise_id] = [];
      }
      exerciseGroups[exercise.exercise_id].push(exercise);
    });
  
    // Update target reps for each group
    Object.values(exerciseGroups).forEach(exercises => {
      // Calculate average completion rate for the group
      const groupCompletionRate = exercises.reduce((sum, exercise) => {
        const actualReps = exercise.actual_reps ?? 0;
        const totalTargetReps = exercise.target_reps * exercise.target_sets;
        const totalActualReps = actualReps * exercise.target_sets;
        return sum + (totalActualReps / totalTargetReps);
      }, 0) / exercises.length;
  
      // Determine new target reps based on group performance
      let newTargetReps: number;
      if (groupCompletionRate < 0.8) {
        newTargetReps = Math.max(1, Math.floor(exercises[0].target_reps - 1));
      } else if (groupCompletionRate >= 0.8 && groupCompletionRate < 0.9) {
        newTargetReps = Math.max(1, Math.floor(exercises[0].target_reps - 1));
      } else if (groupCompletionRate >= 1) {
        newTargetReps = Math.floor(exercises[0].target_reps + 1);
      } else {
        newTargetReps = exercises[0].target_reps;
      }
  
      // Apply same target reps to all exercises in group
      exercises.forEach(exercise => {
        exercise.target_reps = newTargetReps;
      });
    });
  
    return workoutWithExercises;
  }