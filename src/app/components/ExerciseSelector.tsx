"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./ExerciseSelector.module.css";

export default function ExerciseSelector ({ exercises }) {
    const Router = useRouter();
    const [selectedExercises, setSelectedExercises] = useState([]);

    const handleSelect = (exercise: any) => {
        if (selectedExercises.includes(exercise)) {
            setSelectedExercises(selectedExercises.filter((e) => e !== exercise));
        } else {
            setSelectedExercises([...selectedExercises, exercise]);
        }
    };

    const startWorkout = async (selectedExercises: any) => {
        console.log("selectedExercises", selectedExercises);
        if (selectedExercises.length === 0) {
            //FIXME: show error
            console.log("No exercises selected");
        }

        console.log("selectedExercises", selectedExercises);
        const response = await fetch('/api/workouts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exercises: selectedExercises
            })
            })

        if (response.ok) {
            console.log("Workout created");
        } else {
            console.log("Failed to create workout",response);
        }

        setSelectedExercises([]);

        // FIXME: fix the redirect to a workout page
        Router.push('/workouts/create');
    }

    return(
        <div>
            {exercises.map((exercise) => (
                <div 
                key={exercise.id} 
                className={`${styles.exercise} ${selectedExercises.includes(exercise) ? styles.selected : ''}`}
                onClick={() => {
                    handleSelect(exercise);
                }}
            >
                    <div>{exercise.name} x{exercise.base_frequency}</div>
                    <div>{exercise.category}</div>
                </div>
            ))}
            <button onClick={() => startWorkout(selectedExercises)} disabled={selectedExercises.length === 0}>Start Workout with {selectedExercises.length} exercises</button>
        </div>
    )
}