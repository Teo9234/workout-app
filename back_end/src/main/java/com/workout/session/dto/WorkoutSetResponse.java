package com.workout.session.dto;

import java.math.BigDecimal;

public record WorkoutSetResponse(
                Long id,
                Long workoutSessionId,
                Long exerciseId,
                Integer setNumber,
                Integer reps,
                BigDecimal weight,
                Integer durationSeconds,
                Integer rpe,
                Boolean completed) {
}
