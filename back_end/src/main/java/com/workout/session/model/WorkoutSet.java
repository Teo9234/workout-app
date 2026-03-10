package com.workout.session.model;

import java.math.BigDecimal;

import com.workout.exercise.model.Exercise;

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
@Table(name = "workout_sets")
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Workout session is required")
    @ManyToOne
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession workoutSession;

    @NotNull(message = "Exercise is required")
    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @NotNull(message = "Set number is required")
    @Min(value = 1, message = "Set number must be at least 1")
    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Min(value = 0, message = "Reps cannot be negative")
    @Column(name = "reps")
    private Integer reps;

    @Min(value = 0, message = "Weight cannot be negative")
    @Column(name = "weight", precision = 10, scale = 2)
    private BigDecimal weight;

    @Min(value = 0, message = "Duration cannot be negative")
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Min(value = 0, message = "RPE must be between 0 and 10")
    @Column(name = "rpe")
    private Integer rpe;

    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    // Constructor for creating new WorkoutSet instances
    public WorkoutSet(WorkoutSession workoutSession, Exercise exercise, Integer setNumber) {
        this.workoutSession = workoutSession;
        this.exercise = exercise;
        this.setNumber = setNumber;
        this.completed = false;
    }

    // Full constructor with all fields
    public WorkoutSet(WorkoutSession workoutSession, Exercise exercise, Integer setNumber,
            Integer reps, BigDecimal weight, Integer durationSeconds, Integer rpe) {
        this(workoutSession, exercise, setNumber);
        this.reps = reps;
        this.weight = weight;
        this.durationSeconds = durationSeconds;
        this.rpe = rpe;
    }
}
