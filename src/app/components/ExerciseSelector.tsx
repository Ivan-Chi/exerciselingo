"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./ExerciseSelector.module.css";
import { Database } from '@/../database.types';

// Define types from your database schema
type Exercise = Database['public']['Tables']['exercises']['Row'];

interface ExerciseSelectorProps {
    exercises: Exercise[];
}

export default function ExerciseSelector({ exercises }: ExerciseSelectorProps) {
    const router = useRouter();  
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

    const handleSelect = (exercise: Exercise): void => {
        if (selectedExercises.includes(exercise)) {
            setSelectedExercises(selectedExercises.filter((e) => e !== exercise));
        } else {
            setSelectedExercises([...selectedExercises, exercise]);
        }
    };

    const startWorkout = async (selectedExercises: Exercise[]): Promise<void> => {
        if (selectedExercises.length === 0) {
            //FIXME: show error
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
        // FIXME: fix the redirect to a workout page
        router.push('/workouts/session');
    }

    return (
        <div>
            {exercises.map((exercise) => (
                <div
                    key={exercise.id}
                    className={`${styles.exercise} ${selectedExercises.includes(exercise) ? styles.selected : ''}`}
                    onClick={() => handleSelect(exercise)}
                >
                    <div>{exercise.name} x{exercise.base_frequency}</div>
                    <div>{exercise.category}</div>
                </div>
            ))}
            <button 
                onClick={() => startWorkout(selectedExercises)} 
                disabled={selectedExercises.length === 0}
            >
                Start Workout with {selectedExercises.length} exercises
            </button>
        </div>
    );
}