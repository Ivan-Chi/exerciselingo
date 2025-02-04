// WorkoutSessionClient.tsx
"use client";
import { useState } from 'react';
import WorkoutExercise from './WorkoutExercise';
import { useRouter } from 'next/navigation';

type Workout = {
   id: number;
   created_at: string;
   workout_exercises: {
       target_sets: number;
       target_reps: number;
       exercise_id: number;
       exercises: {
           id: number;
           name: string;
           description: string;
       };
   }[];
};

type CompletedSet = {
   exerciseId: number;
   setIndex: number;
   reps: number;
};

export default function WorkoutSessionClient({ initialWorkout }: { initialWorkout: Workout }) {
   const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
    const router = useRouter();

    const handleWorkoutComplete = async () => {
        try {
            const response = await fetch('/api/workouts/complete-workout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workoutId: initialWorkout.id,
                    completedSets: completedSets
                })
            });

            if (!response.ok) throw new Error('Failed to save workout');
            router.push('/history');
        } catch (error) {
            console.error(error);
            alert('Failed to save workout');
        }   
    };

   const handleRepsUpdate = (exerciseId: number, setIndex: number, reps: number) => {
       setCompletedSets(prev => {
           const existingSetIndex = prev.findIndex(
               set => set.exerciseId === exerciseId && set.setIndex === setIndex
           );
           if (existingSetIndex >= 0) {
               const newSets = [...prev];
               newSets[existingSetIndex] = { exerciseId, setIndex, reps };
               return newSets;
           }
           return [...prev, { exerciseId, setIndex, reps }];
       });
   };

   return (
       <div>
           <h1>Workout Session</h1>
           {initialWorkout.workout_exercises.map(exercise => (
               <div key={exercise.exercise_id}>
                   {[...Array(exercise.target_sets)].map((_, setIndex) => (
                       <WorkoutExercise
                           key={setIndex}
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

