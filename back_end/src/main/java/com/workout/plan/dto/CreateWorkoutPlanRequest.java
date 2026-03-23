package com.workout.plan.dto;

import com.workout.plan.model.PlanDifficulty;
import com.workout.plan.model.WorkoutPlanType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateWorkoutPlanRequest(

        @NotBlank(message = "Workout plan name is required") @Size(min = 2, max = 120, message = "Workout plan name must be between 2 and 120 characters") String name,

        @Size(max = 500, message = "Workout plan description cannot exceed 500 characters") String description,

        @NotNull(message = "Workout plan type is required") WorkoutPlanType planType,

        @NotNull(message = "Workout plan difficulty is required") PlanDifficulty difficulty,

        Boolean active

) {

}
