package com.workout.planexercise.model;

import com.workout.exercise.model.Exercise;
import com.workout.plan.model.WorkoutPlan;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "workout_plan_exercises")
public class WorkoutPlanExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Workout plan is required")
    @ManyToOne
    @JoinColumn(name = "workout_plan_id", nullable = false)
    private WorkoutPlan workoutPlan;

    @NotNull(message = "Exercise is required")
    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @NotNull(message = "Order index is required")
    @Min(value = 1, message = "Order index must be at least 1")
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @NotNull(message = "Target sets is required")
    @Min(value = 1, message = "Target sets must be at least 1")
    @Column(name = "target_sets", nullable = false)
    private Integer targetSets;

    @NotNull(message = "Target reps is required")
    @Min(value = 1, message = "Target reps must be at least 1")
    @Column(name = "target_reps", nullable = false)
    private Integer targetReps;

    @Min(value = 0, message = "Rest seconds cannot be negative")
    @Column(name = "rest_seconds", nullable = false)
    private Integer restSeconds;

    // Constructor for creating new WorkoutPlanExercise instances
    public WorkoutPlanExercise(WorkoutPlan workoutPlan, Exercise exercise, Integer orderIndex,
            Integer targetSets, Integer targetReps, Integer restSeconds) {
        this.workoutPlan = workoutPlan;
        this.exercise = exercise;
        this.orderIndex = orderIndex;
        this.targetSets = targetSets;
        this.targetReps = targetReps;
        this.restSeconds = restSeconds;
    }
}
