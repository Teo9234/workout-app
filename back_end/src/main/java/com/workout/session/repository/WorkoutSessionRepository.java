package com.workout.session.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.session.model.WorkoutSession;
import com.workout.user.model.User;
import com.workout.plan.model.WorkoutPlan;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    // Find all sessions for a user, ordered by date (newest first)
    List<WorkoutSession> findByUserOrderBySessionDateDesc(User user);

    // Find sessions for a user within a date range
    List<WorkoutSession> findByUserAndSessionDateBetween(User user, LocalDate startDate, LocalDate endDate);

    // Find sessions for a specific workout plan
    List<WorkoutSession> findByWorkoutPlan(WorkoutPlan workoutPlan);

    // Find a specific session by user and date
    WorkoutSession findByUserAndSessionDate(User user, LocalDate sessionDate);

    // Count sessions for a user (useful for stats)
    long countByUser(User user);
}
