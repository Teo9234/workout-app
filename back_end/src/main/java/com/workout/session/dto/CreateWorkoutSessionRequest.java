package com.workout.session.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateWorkoutSessionRequest(

        @NotNull(message = "User ID is required") Long userId,

        @NotNull(message = "Session date is required") LocalDate sessionDate,

        LocalDateTime startTime,

        LocalDateTime endTime,

        @Size(max = 500, message = "Notes cannot exceed 500 characters") String notes,

        Long workoutPlanId) {

}
