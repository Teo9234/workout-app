package com.workout.session.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WorkoutSessionResponse(
        Long id,
        Long userId,
        LocalDate sessionDate,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String notes,
        Long workoutPlanId) {
}
