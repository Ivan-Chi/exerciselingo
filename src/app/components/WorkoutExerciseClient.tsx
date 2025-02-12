"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from '@/../database.types';
import styles from "./WorkoutExerciseClient.module.css"; 

type Tables = Database['public']['Tables'];
type WorkoutWithExercises = Tables['workouts']['Row'] & {
    workout_exercises: (
        Database['public']['Tables']['workout_exercises']['Row'] & {
            exercise: Database['public']['Tables']['exercises']['Row']
        }   
    )[]
}

function getSetKey (workoutId: number, exerciseId: number, orderInWorkout: number){
    return `${workoutId}-${exerciseId}-${orderInWorkout}`;
} 

function updateWorkoutWithCompletedSets(workout: WorkoutWithExercises, completedSets: Map<string, number>) {
    return {
        ...workout,
        workout_exercises: workout.workout_exercises.map(exercise => ({
            ...exercise,
            actual_reps: completedSets.get(getSetKey(
                exercise.workout_id,
                exercise.exercise_id,
                exercise.order_in_workout
            )) ?? 0,
            completed_at: new Date().toISOString()
        }))
    };
}


export default function WorkoutSessionClient({workoutWithExercises}: {workoutWithExercises: WorkoutWithExercises}) {
   const router = useRouter();
   const [completedSets, setCompletedSets] = useState<Map<string, number>>(new Map());

   function updatePerformedReps(workoutId: number, exerciseId: number, orderInWorkout: number, newReps: number) {
    setCompletedSets(prevSets => {
        const newSets = new Map(prevSets);
        const key = getSetKey(workoutId, exerciseId, orderInWorkout);
        newSets.set(key, newReps);
        return newSets;
    });
}

    const completeWorkout = async () => {
        try {
            const updatedWorkout = updateWorkoutWithCompletedSets(workoutWithExercises, completedSets);
            const response = await fetch('/api/workouts/complete-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workout: updatedWorkout })
            });
            if (!response.ok) throw new Error('Failed to save workout');
            router.push('/history');
        } catch (error) {
            console.error(error);
            alert('Failed to save workout');
        }
    };

   return (
       <div>
           <h1>Your Workout Session:</h1>
           <div className={styles.container}>
                <div className={styles.exerciseList}>
                    {workoutWithExercises.workout_exercises.map(workoutExercise => (
                        <div key={`${workoutExercise.exercise_id}-${workoutExercise.order_in_workout}`} className={styles.exercise}>
                            <div className={styles.exerciseStats}>
                                <div className={styles.exerciseTitle}>Exercise {workoutExercise.order_in_workout} </div> <br />
                                <div className={styles.exerciseName}>{workoutExercise.exercise.name} </div> <br />
                            </div>
                            <div className={styles.exerciseReps}>
                            Target Reps: {workoutExercise.target_reps} <br />
                            <div className={styles.completedReps}>
                                Completed Reps:
                                <input
                                    type="number"
                                    max="99"
                                    min="0"
                                    value={completedSets.get(getSetKey(
                                        workoutExercise.workout_id,
                                        workoutExercise.exercise_id,
                                        workoutExercise.order_in_workout
                                    )) || 0}
                                    onChange={(e) => {
                                        const newReps = Math.min(99, Math.max(0,Number(e.target.value)));
                                        updatePerformedReps(
                                            workoutExercise.workout_id,
                                            workoutExercise.exercise_id,
                                            workoutExercise.order_in_workout,
                                            newReps
                                        );
                                    }}
                                />
                            </div>
                            </div>
                        </div>
                    ))}
                </div>  
             <button onClick={completeWorkout} className={styles.workoutButton}>Complete Workout</button>
           </div>
       </div>
   );
}

