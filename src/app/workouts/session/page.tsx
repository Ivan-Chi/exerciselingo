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
        exercise_id: number;
        exercises: {
            id: number;
            name: string;
            description: string;  // non-nullable
        };
    }[];
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
                exercise_id,
                exercises (
                    id,
                    name,
                    description
                )
            )
        `)
        .order('created_at', { ascending: false })
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
            exercise_id: we.exercise_id,
            exercises: {
                id: we.exercises.id,
                name: we.exercises.name,
                description: we.exercises.description ?? 'No description provided'
            }
        }))
    };

    return (
        <WorkoutSessionClient initialWorkout={validatedWorkout} />
    );
}

