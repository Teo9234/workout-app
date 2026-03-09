package com.workout.plan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.plan.model.PlanDifficulty;
import com.workout.plan.model.WorkoutPlan;
import com.workout.plan.model.WorkoutPlanType;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {

    Optional<WorkoutPlan> findByNameIgnoreCase(String name);

    List<WorkoutPlan> findByPlanType(WorkoutPlanType planType);

    List<WorkoutPlan> findByDifficulty(PlanDifficulty difficulty);

    List<WorkoutPlan> findByActiveTrue();
}