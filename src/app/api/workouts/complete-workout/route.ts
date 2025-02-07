import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

type CompletedSet = {
    exerciseId: number;
    setIndex: number;
    actualReps: number;
    nextTargetReps?: number;
    nextTargetSets?: number;
};

type SetUpdate = {
    completed_at: Date;
    actual_reps: number;
    target_reps?: number;
    target_sets?: number;
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
       
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // First update the workout completion time
        const { data: completedWorkout, error: completedWorkoutError } = await supabase
            .from('workouts')
            .update({ completed_at: new Date() })
            .eq('id', body.workoutId)
            .single()

        if (completedWorkoutError) throw completedWorkoutError

        // Helper function to build our update object
        const buildSetUpdate = (set: CompletedSet): SetUpdate => {
            const setUpdate: SetUpdate = {
                completed_at: new Date(),
                actual_reps: set.actualReps,
            }

            // Only add target sets if provided
            if (set.nextTargetSets) {
                setUpdate.target_sets = set.nextTargetSets;            
            }

            // Only add target reps if provided
            if (set.nextTargetReps) {
                setUpdate.target_reps = set.nextTargetReps;            
            }
            return setUpdate;
        }

        // Process each completed set
        for (const set of body.completedSets) {
            const updateData = buildSetUpdate(set)  
            const { error } = await supabase
                .from('workout_exercises')
                .update(updateData) 
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