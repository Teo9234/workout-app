package com.workout.exercise.dto;

import com.workout.exercise.model.Equipment;
import com.workout.exercise.model.MuscleGroup;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateExerciseRequest(
        @NotBlank(message = "Exercise name is required") @Size(min = 2, max = 30, message = "Exercise name must be between 2 and 30 characters") String name,

        @NotNull(message = "Muscle group is required") MuscleGroup muscleGroup,

        @NotNull(message = "Equipment is required") Equipment equipment,

        @Size(max = 500, message = "Description cannot exceed 500 characters") String description) {
}
