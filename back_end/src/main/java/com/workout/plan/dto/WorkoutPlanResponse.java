package com.workout.plan.dto;

import com.workout.plan.model.PlanDifficulty;
import com.workout.plan.model.WorkoutPlanType;

public record WorkoutPlanResponse(
        Long id,
        String name,
        String description,
        WorkoutPlanType planType,
        PlanDifficulty difficulty,
        boolean active) {
}
