import { updateTargetSets } from "@/app/api/workouts/complete-workout/route";
import { Database } from '@/../database.types';

type Tables = Database['public']['Tables'];
type WorkoutWithExercises = Tables['workouts']['Row'] & {
    workout_exercises: (
        Tables['workout_exercises']['Row'] & {
            exercise: Tables['exercises']['Row']
        }   
    )[]
}

describe('updateTargetSets', () => {
    const mockExercise: Tables['exercises']['Row'] = {
        id: 1,
        name: 'Push-ups',
        description: null,
        category: null,
        base_frequency: 1,
        base_unit: null,
        base_weight: null,
        created_at: null,
      };
    
    const createMockWorkoutWithExercises = (
        exerciseId: number, 
        actualReps: number | null, 
        targetReps: number, 
        targetSets: number
        ): WorkoutWithExercises => ({
        id: 1,
        date: '2025-02-07',
        description: null,
        created_at: '2025-02-07T12:34:07.026233',
        profile_id: '98bf2ed9-c6ff-42d6-b95f-79996ec50bef',
        completed_at: null,
        workout_exercises: Array(3).fill(null).map((_, index) => ({
            exercise: mockExercise,
            workout_id: 1,
            actual_reps: actualReps,
            actual_sets: null,
            exercise_id: exerciseId,
            target_reps: targetReps,
            target_sets: targetSets,
            completed_at: null,
            actual_weight: null,
            target_weight: null,
            order_in_workout: index + 1
        }))
    });

    test('should decrease target reps when completion rate is below 80%', () => {
      // Create a workout where actual reps are significantly below target
      const workout = createMockWorkoutWithExercises(1, 1, 5, 3);
      
      const result = updateTargetSets(workout);
      
      // Check that target reps were decreased by 0.2 and rounded
      expect(result.workout_exercises[0].target_reps).toBe(4);
      expect(result.workout_exercises[1].target_reps).toBe(4);
      expect(result.workout_exercises[2].target_reps).toBe(4);
    });
  
    test('should decrease target reps slightly when completion rate is between 80% and 90%', () => {
      // Create a workout where actual reps are slightly below target
      const workout = createMockWorkoutWithExercises(1, 13, 15, 4);
      
      const result = updateTargetSets(workout);
      
      // Check that target reps were decreased by 0.1 and rounded
      expect(result.workout_exercises[0].target_reps).toBe(14);
      expect(result.workout_exercises[1].target_reps).toBe(14);
      expect(result.workout_exercises[2].target_reps).toBe(14);
      expect(result.workout_exercises[2].target_reps).toBe(14);
    });
  
    test('should increase target reps when completion rate is 100% or higher', () => {
      // Create a workout where actual reps exceed target
      const workout = createMockWorkoutWithExercises(1, 6, 5, 3);
      
      const result = updateTargetSets(workout);
      
      // Check that target reps were increased by 0.1 and rounded
      expect(result.workout_exercises[0].target_reps).toBe(6);
      expect(result.workout_exercises[1].target_reps).toBe(6);
      expect(result.workout_exercises[2].target_reps).toBe(6);
    });
  
    test('should handle multiple exercise types independently', () => {
      const workout = {
        ...createMockWorkoutWithExercises(1, 6, 5, 3),
        workout_exercises: [
          ...createMockWorkoutWithExercises(1, 6, 5, 3).workout_exercises,
          ...createMockWorkoutWithExercises(2, 4, 5, 3).workout_exercises
        ]
      };
      
      const result = updateTargetSets(workout);
      
      // Check that exercise 1 and exercise 2 were updated independently
      const exercise1Results = result.workout_exercises
        .filter(ex => ex.exercise_id === 1)
        .map(ex => ex.target_reps);
      const exercise2Results = result.workout_exercises
        .filter(ex => ex.exercise_id === 2)
        .map(ex => ex.target_reps);
      
      // Exercise 1 should increase (high completion rate)
      expect(exercise1Results).toEqual([6, 6, 6]);
      // Exercise 2 should decrease (low completion rate)
      expect(exercise2Results).toEqual([4, 4, 4]);
    });
  
    test('should handle null values gracefully', () => {
      const workout = createMockWorkoutWithExercises(1, null, 5, 3);
      
      const result = updateTargetSets(workout);
      
      // Should treat null as 0 and decrease target reps
      expect(result.workout_exercises[0].target_reps).toBe(4);
    });
  
    test('should not decrease target reps below 1', () => {
      const workout = createMockWorkoutWithExercises(1, 0, 1, 3);
      
      const result = updateTargetSets(workout);
      
      // Should maintain minimum of 1 target rep
      expect(result.workout_exercises[0].target_reps).toBe(1);
    });
  });