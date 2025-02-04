import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: completedWorkout, error: completedWorkoutError } = await supabase
            .from('workouts')
            .update({ completed_at: new Date() })
            .eq('id', body.workoutId)
            .single()

        if (completedWorkoutError) throw completedWorkoutError

        // Update each workout exercise separately
        for (const set of body.completedSets) {
            const { error } = await supabase
                .from('workout_exercises')
                .update({ 
                    completed_at: new Date(),
                    actual_reps: set.reps 
                })
                .eq('workout_id', body.workoutId)
                .eq('exercise_id', set.exerciseId)
                .eq('order_in_workout', set.setIndex)

            if (error) throw error
        }

        return NextResponse.json(completedWorkout)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 })
    }
}