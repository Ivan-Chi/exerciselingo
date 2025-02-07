"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./ExerciseSelector.module.css";
import { Database } from "@/../database.types"

type Tables = Database['public']['Tables'];

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

interface ExerciseSelectorProps {
    exercises: ExerciseWithHistory[]
  }



export default function ExerciseSelector({exercises}: ExerciseSelectorProps)  {
    const router = useRouter();  
    const [selectedExercises, setSelectedExercises] = useState<ExerciseWithHistory[]>([]);

    const handleSelect = (exercise: ExerciseWithHistory): void => {
        if (selectedExercises.includes(exercise)) {
            setSelectedExercises(selectedExercises.filter((e) => e !== exercise));
        } else {
            setSelectedExercises([...selectedExercises, exercise]);
        }
    };

    const startWorkout = async (selectedExercises: ExerciseWithHistory[]): Promise<void> => {
        if (selectedExercises.length === 0) {
            console.log("No exercises selected");
            return;
        }

        const response = await fetch('/api/workouts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exercises: selectedExercises
            })
        });

        if (response.ok) {
            console.log("Workout created");
        } else {
            console.log("Failed to create workout", response);
        }

        setSelectedExercises([]);
        router.push('/workouts/session');
    }

    return (
        <div>
            {exercises.map((exercise) => (
                <div
                    key={exercise.exercise_id.id}
                    className={`${styles.exercise} ${selectedExercises.includes(exercise) ? styles.selected : ''}`}
                    onClick={() => handleSelect(exercise)}
                >
                    <div>{exercise.exercise_id.name} x{exercise.target_sets}</div>
                    <div>{exercise.exercise_id.category}</div>
                </div>
            ))}
            <button 
                onClick={() => startWorkout(selectedExercises)} 
                disabled={selectedExercises.length === 0}
            >
                Start Workout with {selectedExercises.length} exercises
            </button>
        </div>
    )
}