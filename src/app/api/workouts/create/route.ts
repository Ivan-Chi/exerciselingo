import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Database } from '@/../database.types'

type Tables = Database['public']['Tables']

interface RequestExercise {
   id: number;
   base_frequency: number;
   base_weight: number | null;
}

interface RequestBody {
   exercises: RequestExercise[];
   description?: string;
}

type WorkoutExercise = Omit<Tables['workout_exercises']['Insert'], 
    'completed_at' | 'actual_sets' | 'actual_reps' | 'actual_weight'
>;

export async function POST(request: Request) {
   console.log("route hit");
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

       const exercisesWithOrder: WorkoutExercise[] = body.exercises.map((exercise, index) => ({
           workout_id: workout.id,
           exercise_id: exercise.id,
           target_sets: ,//this should be calculated off the actual
           target_reps: 0,
           order_in_workout: index + 1
            // target_weight: exercise.base_weight,
       }));

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