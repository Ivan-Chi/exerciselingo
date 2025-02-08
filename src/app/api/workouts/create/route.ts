import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Database } from '@/../database.types'

type Tables = Database['public']['Tables']
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
    completed_at: Date;
}

interface RequestBody {
   exercises: ExerciseWithHistory[];
   description?: string;
}

type WorkoutExercise = Tables['workout_exercises']['Row']

export async function POST(request: Request) {
   try {
       const body = await request.json() as RequestBody;
             
       const supabase = await createClient();
      
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
           return NextResponse.json(
               { error: 'Unauthorized' },
               { status: 401 }
           );
       }

       const { data: workout, error: workoutError } = await supabase
           .from('workouts')
           .insert({
               profile_id: user.id,
               description: body.description || '',
           })
           .select()
           .single();

       if (workoutError) throw workoutError;
       
       const exercisesWithOrder: WorkoutExercise[] = [];
       let orderCounter = 1;
       
    //    body.exercises.map((exercise, index) => ({
    //        workout_id: workout.id,
    //        exercise_id: exercise.exercise_id.id,
    //        target_sets: 1,
    //        target_reps: 0,
    //        order_in_workout: index + 1
    //         // target_weight: exercise.base_weight,
    //    }));

    for (const exerciseWithHistory of body.exercises) {
        // Create one entry for each set of the exercise
        for (let setNumber = 1; setNumber <= exerciseWithHistory.target_sets; setNumber++) {
            exercisesWithOrder.push({
                workout_id: workout.id,
                exercise_id: exerciseWithHistory.exercise_id.id,
                order_in_workout: orderCounter++,
                target_sets: exerciseWithHistory.target_sets,
                target_reps: exerciseWithHistory.target_reps,
                target_weight: exerciseWithHistory.target_weight ?? null,
                actual_sets: null,
                actual_reps: null,
                actual_weight: null,
                completed_at: null
            });
        }
    }

       const { error: exercisesError } = await supabase
           .from('workout_exercises')
           .insert(exercisesWithOrder);

       if (exercisesError) throw exercisesError;

       return NextResponse.json(workout);
   } catch (error) {
       console.error('Error creating workout:', error);
       return NextResponse.json(
           { error: 'Internal Server Error' },
           { status: 500 }
       );
   }
}