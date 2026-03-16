package com.workout.session.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workout.plan.model.WorkoutPlan;
import com.workout.plan.service.WorkoutPlanService;
import com.workout.session.model.WorkoutSession;
import com.workout.session.service.WorkoutSessionService;
import com.workout.user.model.User;
import com.workout.user.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;
    private final UserService userService;
    private final WorkoutPlanService workoutPlanService;

    // Constructor injection for services
    public WorkoutSessionController(WorkoutSessionService workoutSessionService, UserService userService,
            WorkoutPlanService workoutPlanService) {
        this.workoutSessionService = workoutSessionService;
        this.userService = userService;
        this.workoutPlanService = workoutPlanService;
    }

    // Get all workout sessions
    @GetMapping
    public List<WorkoutSession> getAllWorkoutSessions() {
        return workoutSessionService.getAllWorkoutSessions();
    }

    // Get a workout session by ID
    @GetMapping("/{id}")
    public WorkoutSession getWorkoutSessionById(@PathVariable Long id) {
        return workoutSessionService.getWorkoutSessionById(id);
    }

    // Get all workout sessions for a user
    // For example, GET /api/workout-sessions/user/123 would return all sessions for
    // user with ID 123
    @GetMapping("/user/{userId}")
    public List<WorkoutSession> getWorkoutSessionsByUser(@PathVariable Long userId) {
        return workoutSessionService.getByUser(userService.getUserById(userId));
    }

    // Get workout sessions for a user between two dates
    @GetMapping("/user/{userId}/between")
    public List<WorkoutSession> getWorkoutSessionsByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = userService.getUserById(userId);
        return workoutSessionService.getByUserAndDateRange(user, startDate, endDate);
    }

    // Get workout sessions for a user in the current month (useful for stats)
    @GetMapping("/user/{userId}/this-month")
    public List<WorkoutSession> getWorkoutSessionsByUserThisMonth(@PathVariable Long userId) {
        return workoutSessionService.getByUserThisMonth(userService.getUserById(userId));
    }

    // Create a new workout session. Note: No {userId} in the path because the user
    // is included in the request body.
    @PostMapping
    public ResponseEntity<WorkoutSession> createWorkoutSession(@Valid @RequestBody WorkoutSession workoutSession) {
        resolveReferences(workoutSession);
        WorkoutSession createdSession = workoutSessionService.createWorkoutSession(workoutSession);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
    }

    // Update an existing workout session by ID
    @PutMapping("/{id}")
    public WorkoutSession updateWorkoutSession(@PathVariable Long id,
            @Valid @RequestBody WorkoutSession workoutSession) {
        resolveReferences(workoutSession);
        return workoutSessionService.updateWorkoutSession(id, workoutSession);
    }

    // Delete a workout session by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutSession(@PathVariable Long id) {
        workoutSessionService.deleteWorkoutSession(id);
        return ResponseEntity.noContent().build();
    }

    private void resolveReferences(WorkoutSession workoutSession) {
        if (workoutSession.getUser() == null || workoutSession.getUser().getId() == null) {
            throw new IllegalArgumentException("user.id is required");
        }

        Long userId = workoutSession.getUser().getId();
        User user = userService.getUserById(userId);
        workoutSession.setUser(user);

        if (workoutSession.getWorkoutPlan() != null) {
            Long planId = workoutSession.getWorkoutPlan().getId();
            if (planId == null) {
                throw new IllegalArgumentException("workoutPlan.id is required when workoutPlan is provided");
            }

            WorkoutPlan workoutPlan = workoutPlanService.getWorkoutPlanById(planId);
            workoutSession.setWorkoutPlan(workoutPlan);
        }
    }
}