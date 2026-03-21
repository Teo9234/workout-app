package com.workout.exercise.dto;

import com.workout.exercise.model.Equipment;
import com.workout.exercise.model.MuscleGroup;

public record ExerciseResponse(
        Long id,
        String name,
        MuscleGroup muscleGroup,
        Equipment equipment,
        String description) {
}
