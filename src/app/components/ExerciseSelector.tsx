"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ExerciseSelector ({ exercises }) {
    console.log("exercises", exercises);
    const Router = useRouter();
    const [selectedExercises, setSelectedExercises] = useState([]);

    const handleSelect = (exercise: any) => {
        if (selectedExercises.includes(exercise)) {
            setSelectedExercises(selectedExercises.filter((e) => e !== exercise));
            console.log("added", selectedExercises);
        } else {
            setSelectedExercises([...selectedExercises, exercise]);
            console.log("removed", selectedExercises);

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
                style={{
                    border: '1px solid red',
                    margin: '10px',
                    padding: '10px',
                    cursor: 'pointer'
                }}
                onClick={() => {
                    handleSelect(exercise);
                }}
            >
                    <div>{exercise.name}</div>
                    <div>{exercise.category}</div>
                    <div>{exercise.base_frequency}</div>
                </div>
            ))}
            <button onClick={() => startWorkout(selectedExercises)} disabled={selectedExercises.length === 0}>Start Workout with {selectedExercises.length} exercises</button>
        </div>
    )
}