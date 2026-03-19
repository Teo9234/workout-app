package com.workout.planexercise.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateWorkoutPlanExerciseRequest(
        @NotNull(message = "Order index is required") @Min(value = 1, message = "Order index must be at least 1") Integer orderIndex,

        @NotNull(message = "Target sets is required") @Min(value = 1, message = "Target sets must be at least 1") Integer targetSets,

        @NotNull(message = "Target reps is required") @Min(value = 1, message = "Target reps must be at least 1") Integer targetReps,

        @NotNull(message = "Rest seconds is required") @Min(value = 0, message = "Rest seconds cannot be negative") Integer restSeconds) {
}