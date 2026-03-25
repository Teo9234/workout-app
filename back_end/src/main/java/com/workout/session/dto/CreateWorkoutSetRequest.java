package com.workout.session.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateWorkoutSetRequest(

        @NotNull(message = "Set number is required") @Min(value = 1, message = "Set number must be at least 1") Integer setNumber,

        @Min(value = 0, message = "Repetitions must be at least 0") Integer reps,

        @Min(value = 0, message = "Weight must be at least 0") BigDecimal weight,

        @Min(value = 0, message = "Duration must be at least 0") Integer durationSeconds,

        @Min(value = 0, message = "RPE must be at least 0") @Max(value = 10, message = "RPE must be at most 10") Integer rpe,

        Boolean completed) {

}
