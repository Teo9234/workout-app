package com.workout.session.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.workout.core.exceptions.ResourceNotFoundException;
import com.workout.plan.model.WorkoutPlan;
import com.workout.session.model.WorkoutSession;
import com.workout.session.repository.WorkoutSessionRepository;
import com.workout.user.model.User;

@Service
public class WorkoutSessionService {

    private final WorkoutSessionRepository workoutSessionRepository;

    // Constructor injection: Spring provides WorkoutSessionRepository
    // automatically.
    public WorkoutSessionService(WorkoutSessionRepository workoutSessionRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
    }

    // Get all sessions
    public List<WorkoutSession> getAllWorkoutSessions() {
        return workoutSessionRepository.findAll();
    }

    // Get one session by id
    public WorkoutSession getWorkoutSessionById(Long id) {
        return workoutSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutSession", "id", id));
    }

    // Get all sessions for a user
    public List<WorkoutSession> getByUser(User user) {
        return workoutSessionRepository.findByUserOrderBySessionDateDesc(user);
    }

    // Get sessions for a user between two dates
    public List<WorkoutSession> getByUserAndDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return workoutSessionRepository.findByUserAndSessionDateBetween(user, startDate, endDate);
    }

    // Get sessions for a workout plan
    public List<WorkoutSession> getByWorkoutPlan(WorkoutPlan workoutPlan) {
        return workoutSessionRepository.findByWorkoutPlan(workoutPlan);
    }

    // Get one session by user and date
    public WorkoutSession getByUserAndSessionDate(User user, LocalDate sessionDate) {
        WorkoutSession result = workoutSessionRepository.findByUserAndSessionDate(user, sessionDate);
        if (result == null) {
            throw new ResourceNotFoundException("WorkoutSession", "user/date", user.getId() + "/" + sessionDate);
        }
        return result;
    }

    // Create a session
    public WorkoutSession createWorkoutSession(WorkoutSession workoutSession) {
        return workoutSessionRepository.save(workoutSession);
    }

    // Update a session
    public WorkoutSession updateWorkoutSession(Long id, WorkoutSession updatedWorkoutSession) {
        WorkoutSession existing = getWorkoutSessionById(id);
        existing.setUser(updatedWorkoutSession.getUser());
        existing.setSessionDate(updatedWorkoutSession.getSessionDate());
        existing.setStartTime(updatedWorkoutSession.getStartTime());
        existing.setEndTime(updatedWorkoutSession.getEndTime());
        existing.setNotes(updatedWorkoutSession.getNotes());
        existing.setWorkoutPlan(updatedWorkoutSession.getWorkoutPlan());
        return workoutSessionRepository.save(existing);
    }

    // Delete a session
    public void deleteWorkoutSession(Long id) {
        WorkoutSession existing = getWorkoutSessionById(id);
        workoutSessionRepository.delete(existing);
    }

    // Count sessions for a user
    public long countByUser(User user) {
        return workoutSessionRepository.countByUser(user);
    }
}
