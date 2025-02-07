import { createClient } from "@/utils/supabase/server";
import WorkoutSessionClient from '@/app/components/WorkoutExerciseClient';
import { Database } from '@/../database.types';

type Tables = Database['public']['Tables'];

type WorkoutFromDB = {
    id: Tables['workouts']['Row']['id'];
    created_at: Tables['workouts']['Row']['created_at'];
    workout_exercises: {
        target_sets: Tables['workout_exercises']['Row']['target_sets'];
        target_reps: Tables['workout_exercises']['Row']['target_reps'];
        actual_sets: Tables['workout_exercises']['Row']['actual_sets'];
        actual_reps: Tables['workout_exercises']['Row']['actual_reps'];
        exercise_id: Tables['workout_exercises']['Row']['exercise_id'];
        exercises: Pick<Tables['exercises']['Row'], 'id' | 'name' | 'description'>;
    }[];
};

type ValidatedWorkout = {
    id: number;
    created_at: string;  // non-nullable
    workout_exercises: {
        target_sets: number;
        target_reps: number;
        actual_sets: number;
        actual_reps: number;
        exercise_id: number;
        exercises: {
            id: number;
            name: string;
            description: string;  // non-nullable
        };
    }[];
};

type ExercisePerformance = {
    exercise_id: number;
    completion_percentage: number;
    last_target_reps: number;
    last_actual_reps: number;
};

export default async function WorkoutSession() {
    const supabase = await createClient();
   
    const { data: workout, error } = await supabase
        .from('workouts')
        .select(`
            id,
            created_at,
            workout_exercises!inner (
                target_sets,
                target_reps,
                actual_sets,
                actual_reps,
                exercise_id,
                exercises (
                    id,
                    name,
                    description
                )
            )
        `)
        .order('created_at', { ascending: false })
        .is('completed_at', null)
        .limit(1)
        .single();

    if (error) {
        console.log(error);
        return <div>Error loading workout</div>;
    }

    if (!workout) {
        return (
            <div>
                <h1>Workout Session</h1>
                <div>No workout found</div>
            </div>
        );
    }

    const dbWorkout = (workout as unknown) as WorkoutFromDB;

    const validatedWorkout: ValidatedWorkout = {
        id: dbWorkout.id,
        created_at: dbWorkout.created_at ?? new Date().toISOString(),
        workout_exercises: dbWorkout.workout_exercises.map(we => ({
            target_sets: we.target_sets ?? 0,
            target_reps: we.target_reps ?? 0,
            actual_sets: we.actual_sets ?? 0,
            actual_reps: we.actual_reps ?? 0,
            exercise_id: we.exercise_id,
            exercises: {
                id: we.exercises.id,
                name: we.exercises.name,
                description: we.exercises.description ?? 'No description provided'
            }
        }))
    };

    const newTargetPerformance: Map<number, number> = calculateTargetReps(validatedWorkout);

    const updatedWorkout: ValidatedWorkout = {
        ...validatedWorkout,
        workout_exercises: validatedWorkout.workout_exercises.map(exercise => ({
            ...exercise,
            // Use the new target reps if available, otherwise keep the existing target
            target_reps: newTargetPerformance.get(exercise.exercise_id) ?? exercise.target_reps
        }))
    }

    return (
        <WorkoutSessionClient initialWorkout={updatedWorkout} />
    );
}

// Function to calculate performance metrics for each exercise
const calculateExercisePerformance = (workout: ValidatedWorkout): ExercisePerformance[] => {
    return workout.workout_exercises.map(exercise => {
        const completion_percentage = exercise.actual_reps / (exercise.target_reps || 1);
        
        return {
            exercise_id: exercise.exercise_id,
            completion_percentage,
            last_target_reps: exercise.target_reps,
            last_actual_reps: exercise.actual_reps
        };
    });
};

// Function to calculate new target reps based on performance
const calculateNewTargetReps = (performance: ExercisePerformance): number => {
    // If completion is > 100%, increase target by 10%
    if (performance.completion_percentage >= 1) {
        return Math.ceil(performance.last_target_reps * 1.1);
    }
    // If completion is < 80%, decrease target by 10%
    else if (performance.completion_percentage < 0.8) {
        return Math.max(Math.floor(performance.last_target_reps * 0.9), 1);
    }
    // Otherwise keep the same target
    return performance.last_target_reps;
};

// Main function to calculate all new target reps
const calculateTargetReps = (validatedWorkout: ValidatedWorkout): Map<number, number> => {
    const exercisePerformances = calculateExercisePerformance(validatedWorkout);
    
    // Create a Map with exercise_id as key and new target_reps as value
    const newTargetReps = new Map<number, number>();
    
    exercisePerformances.forEach(performance => {
        const newTarget = calculateNewTargetReps(performance);
        newTargetReps.set(performance.exercise_id, newTarget);
    });
    
    return newTargetReps;
};