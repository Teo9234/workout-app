package com.workout.session.service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
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

    // Get sessions from this month for a user (useful for stats)
    public List<WorkoutSession> getByUserThisMonth(User user) {
        YearMonth currentMonth = YearMonth.now();
        return getByUserForMonth(user, currentMonth.getYear(), currentMonth.getMonthValue());
    }

    // Get sessions for a specific month/year so the frontend can navigate month to
    // month.
    public List<WorkoutSession> getByUserForMonth(User user, int year, int month) {
        try {
            YearMonth targetMonth = YearMonth.of(year, month);
            LocalDate startDate = targetMonth.atDay(1);
            LocalDate endDate = targetMonth.atEndOfMonth();
            return getByUserAndDateRange(user, startDate, endDate);
        } catch (DateTimeException ex) {
            throw new IllegalArgumentException("Invalid year/month: " + year + "-" + month);
        }
    }

    // Get sessions from a selected start month up to the current month (inclusive).
    public List<WorkoutSession> getByUserFromStartMonth(User user, int startYear, int startMonth) {
        YearMonth currentMonth = YearMonth.now();
        return getByUserFromMonthToMonth(
                user,
                startYear,
                startMonth,
                currentMonth.getYear(),
                currentMonth.getMonthValue());
    }

    // Get sessions between two months (inclusive) for month-to-month calendar
    // navigation.
    public List<WorkoutSession> getByUserFromMonthToMonth(User user, int startYear, int startMonth, int endYear,
            int endMonth) {
        try {
            YearMonth start = YearMonth.of(startYear, startMonth);
            YearMonth end = YearMonth.of(endYear, endMonth);

            if (start.isAfter(end)) {
                throw new IllegalArgumentException("Start month must be before or equal to end month");
            }

            LocalDate startDate = start.atDay(1);
            LocalDate endDate = end.atEndOfMonth();
            return getByUserAndDateRange(user, startDate, endDate);
        } catch (DateTimeException ex) {
            throw new IllegalArgumentException(
                    "Invalid month range: " + startYear + "-" + startMonth + " to " + endYear + "-" + endMonth);
        }
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
