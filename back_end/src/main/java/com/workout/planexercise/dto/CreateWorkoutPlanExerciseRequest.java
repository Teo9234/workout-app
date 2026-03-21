package com.workout.planexercise.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

public record CreateWorkoutPlanExerciseRequest(
                @NotNull(message = "Order index is required") @Min(value = 1, message = "Order index must be at least 1") @Max(value = 50, message = "Order index cannot exceed 50") Integer orderIndex,

                @NotNull(message = "Target sets is required") @Min(value = 1, message = "Target sets must be at least 1") @Max(value = 20, message = "Target sets cannot exceed 20") Integer targetSets,

                @NotNull(message = "Target reps is required") @Min(value = 1, message = "Target reps must be at least 1") @Max(value = 100, message = "Target reps cannot exceed 100") Integer targetReps,

                @NotNull(message = "Rest seconds is required") @Min(value = 0, message = "Rest seconds cannot be negative") @Max(value = 900, message = "Rest seconds cannot exceed 900") Integer restSeconds) {
}