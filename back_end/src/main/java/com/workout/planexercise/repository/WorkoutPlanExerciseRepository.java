package com.workout.planexercise.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.planexercise.model.WorkoutPlanExercise;
import com.workout.exercise.model.Exercise;
import com.workout.plan.model.WorkoutPlan;

public interface WorkoutPlanExerciseRepository extends JpaRepository<WorkoutPlanExercise, Long> {

    // Find all exercises in a workout plan, ordered by orderIndex
    List<WorkoutPlanExercise> findByWorkoutPlanOrderByOrderIndexAsc(WorkoutPlan workoutPlan);

    // Find a specific exercise in a workout plan
    WorkoutPlanExercise findByWorkoutPlanAndExercise(WorkoutPlan workoutPlan, Exercise exercise);

    // Check order index uniqueness inside a workout plan
    boolean existsByWorkoutPlanAndOrderIndex(WorkoutPlan workoutPlan, Integer orderIndex);

    // Check order index uniqueness inside a workout plan excluding current row
    boolean existsByWorkoutPlanAndOrderIndexAndIdNot(WorkoutPlan workoutPlan, Integer orderIndex, Long id);

    // Count exercises in a workout plan
    long countByWorkoutPlan(WorkoutPlan workoutPlan);
}
