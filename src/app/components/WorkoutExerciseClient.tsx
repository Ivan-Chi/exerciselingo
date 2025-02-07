// WorkoutSessionClient.tsx
"use client";
import { useState } from 'react';
import WorkoutExercise from './WorkoutExercise';
import { useRouter } from 'next/navigation';
import { Database } from '@/../database.types';

type Tables = Database['public']['Tables'];

type Exercise = {
    id: number;
    name: string;
    description: string;  // We'll ensure this is non-null before passing
};

type WorkoutExercise = {
    target_sets: NonNullable<Tables['workout_exercises']['Row']['target_sets']>;
    target_reps: NonNullable<Tables['workout_exercises']['Row']['target_reps']>;
    exercise_id: Tables['workout_exercises']['Row']['exercise_id'];
    exercises: Exercise;  // Using our non-nullable Exercise type
};

type Workout = {
    id: Tables['workouts']['Row']['id'];
    created_at: NonNullable<Tables['workouts']['Row']['created_at']>;
    workout_exercises: WorkoutExercise[];
};

type CompletedSet = {
   exerciseId: number;
   setIndex: number;
   actualReps: number;
   nextTargetReps?: number;
   nextTargetSets?: number;
};

export default function WorkoutSessionClient({ initialWorkout }: { initialWorkout: Workout }) {
    const [allSets, setAllSets] = useState<CompletedSet[]>(() => {
        return initialWorkout.workout_exercises.flatMap(exercise => 
          Array.from({ length: exercise.target_sets }, (_, i) => ({
            exerciseId: exercise.exercise_id,
            setIndex: i + 1,  
            actualReps: 0,
            nextTargetReps: exercise.target_reps,
            nextTargetSets: exercise.target_sets
          }))
        );
      });
   const router = useRouter();

   const handleWorkoutComplete = async () => {
       try {
           const response = await fetch('/api/workouts/complete-workout', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   workoutId: initialWorkout.id,
                   completedSets: allSets,
               })
           });
           if (!response.ok) throw new Error('Failed to save workout');
           router.push('/history');
       } catch (error) {
           console.error(error);
           alert('Failed to save workout');
       }  
   };

// this is hit whenever reps are updated
   const handleRepsUpdate = (exerciseId: number, setIndex: number, reps: number, target_reps?: number, target_sets?: number) => {
    setAllSets(prev => {
           const existingSetIndex = prev.findIndex(
            // Find completed sets with the same exerciseId and setIndex
               set => set.exerciseId === exerciseId && set.setIndex === setIndex
           );
        //     If the set already exists, update its actualReps
           if (existingSetIndex >= 0) {
               const newSets = [...prev];
               newSets[existingSetIndex] = { exerciseId, setIndex, actualReps: reps , nextTargetReps: target_reps, nextTargetSets: target_sets};
               return newSets;
           }
        //     Otherwise, add a new set
           return [...prev, { exerciseId, setIndex, actualReps: reps , nextTargetReps: target_reps, nextTargetSets: target_sets}];
       });
   };

   return (
       <div>
           <h1>Workout Session</h1>
           {initialWorkout.workout_exercises.map(exercise => (
               <div key={exercise.exercise_id}>
                   {[...Array(exercise.target_sets)].map((_, setIndex) => (
                       <WorkoutExercise
                           key={`${exercise.exercise_id}-${setIndex}`}
                           exercise={exercise}
                           setIndex={setIndex}
                           onRepsUpdate={handleRepsUpdate}
                       />
                   ))}
               </div>
           ))}
           <button onClick={handleWorkoutComplete}>Complete Workout</button>
       </div>
   );
}