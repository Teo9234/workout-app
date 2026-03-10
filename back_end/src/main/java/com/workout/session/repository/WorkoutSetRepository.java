package com.workout.session.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.session.model.WorkoutSet;
import com.workout.session.model.WorkoutSession;
import com.workout.exercise.model.Exercise;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    // Find all sets for a specific workout session, ordered by set number
    List<WorkoutSet> findByWorkoutSessionOrderBySetNumberAsc(WorkoutSession workoutSession);

    // Find all sets for a specific exercise in a session
    List<WorkoutSet> findByWorkoutSessionAndExercise(WorkoutSession workoutSession, Exercise exercise);

    // Find completed sets in a session
    List<WorkoutSet> findByWorkoutSessionAndCompletedTrue(WorkoutSession workoutSession);

    // Find incomplete sets in a session
    List<WorkoutSet> findByWorkoutSessionAndCompletedFalse(WorkoutSession workoutSession);

    // Count total sets in a session
    long countByWorkoutSession(WorkoutSession workoutSession);

    // Count completed sets in a session (useful for progress tracking)
    long countByWorkoutSessionAndCompletedTrue(WorkoutSession workoutSession);
}
