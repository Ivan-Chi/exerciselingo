import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface WorkoutExercises {
    workout_id: number;
    exercise_id: number;
    sets: number;
    reps: number;
    weight: number;
    notes: string;
    order_in_workout: number;
  }

export async function POST(request: Request) {
    console.log("route hit");
    try {
        const body = await request.json()
        
        const supabase = await createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' }, 
                { status: 401 }
            )
        }

        // Start a database transaction
        const { data: workout, error: workoutError } = await supabase
            .from('workouts')
            .insert({
                profile_id: user.id,
                description: body.description || '',
            })
            .select()
            .single()

        if (workoutError) throw workoutError

        const exercisesWithOrder: WorkoutExercises[] = body.exercises.map((exercise, index) => ({
            workout_id: workout.id,
            exercise_id: exercise.id,
            target_sets: exercise.base_frequency,
            target_weight: exercise.base_weight,
            order_in_workout: index + 1  // Start from 1 instead of 0 for better readability
        }))

        console.log(body.exercises);
        console.log("exercisesWithOrder", exercisesWithOrder);
        const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(
                exercisesWithOrder.map(exercise => ({
                    ...exercise
                }))
            )

        if (exercisesError) throw exercisesError

        return NextResponse.json(workout)

    } catch (error) {
        console.error('Error creating workout:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        )
    }
}