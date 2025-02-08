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
        const body = await request.json()
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
       
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const workoutWithExercises = body.workout;
        updateTargetSets(workoutWithExercises);
        console.log(workoutWithExercises);
        
       
        // return NextResponse.json(completedWorkout)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 })
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
    
    // TODO: Add calculation for target frequency based on actual rep performance
    //       and then update it in workoutWithExercises
    
    return workoutWithExercises;
  }