"use client";
import { useState } from 'react';

// TODO: DEPRECATED 

type WorkoutExerciseProps = {
    exercise: {
        target_sets: number;
        target_reps: number;
        exercise_id: number;
        exercises: {
            id: number;
            name: string;
            description: string;
        };
    };
    setIndex: number;
    onRepsUpdate: (
        exerciseId: number, 
        setIndex: number, 
        reps: number, 
        target_reps: number, 
        target_sets: number
    ) => void;
};

export default function WorkoutExercise({ 
    exercise, 
    setIndex, 
    onRepsUpdate 
}: WorkoutExerciseProps) {
    const [completedReps, setCompletedReps] = useState<number>(0);
   
    return (
        <div>
            <div>{exercise.exercises.name}</div>
            <div>Set {setIndex + 1}</div>
            <div>{exercise.exercises.description}</div>
            <div>Target: {exercise.target_reps} reps</div>
            <div>
                <label htmlFor={`reps-${exercise.exercise_id}-${setIndex}`}>
                    Completed reps:
                </label>
                <input
                    id={`reps-${exercise.exercise_id}-${setIndex}`}
                    type="number"
                    min="0"
                    max="99"
                    value={completedReps}
                    onChange={(e) => {
                        const newReps = Number(e.target.value);
                        setCompletedReps(newReps);
                        onRepsUpdate(
                            exercise.exercise_id, 
                            setIndex+1, 
                            newReps,
                            exercise.target_reps,
                            exercise.target_sets
                        );
                    }}
                />
            </div>
        </div>
    );
}