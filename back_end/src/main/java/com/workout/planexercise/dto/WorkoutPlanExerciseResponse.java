package com.workout.planexercise.dto;

public record WorkoutPlanExerciseResponse(
        Long id,
        Integer orderIndex,
        Integer targetSets,
        Integer targetReps,
        Integer restSeconds,
        String exerciseName,
        String planName) {
}
