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

// @RestController tells Spring this class handles HTTP requests and returns JSON.
@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;
    private final UserService userService;
    private final WorkoutPlanService workoutPlanService;

    // Constructor injection: Spring provides the services automatically.
    public WorkoutSessionController(WorkoutSessionService workoutSessionService, UserService userService,
            WorkoutPlanService workoutPlanService) {
        this.workoutSessionService = workoutSessionService;
        this.userService = userService;
        this.workoutPlanService = workoutPlanService;
    }

    // GET /api/workout-sessions
    public List<WorkoutSession> getAllSessions() {
        return workoutSessionService.getAllWorkoutSessions();
    }

    // GET /api/workout-sessions/{id}
    @GetMapping("/{id}")
    public WorkoutSession getSessionById(@PathVariable Long id) {
        return workoutSessionService.getWorkoutSessionById(id);
    }

    // GET /api/workout-sessions/user/{userId}
    @GetMapping("/user/{userId}")
    public List<WorkoutSession> getSessionsByUserId(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return workoutSessionService.getByUser(user);
    }

    // GET
    // /api/workout-sessions/user/{userId}/between?startDate=2026-03-01&endDate=2026-03-31
    @GetMapping("/user/{userId}/between")
    public List<WorkoutSession> getSessionsByUserIdAndDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = userService.getUserById(userId);
        return workoutSessionService.getByUserAndDateRange(user, startDate, endDate);
    }

    // GET /api/workout-sessions/user/{userId}/this-month
    @GetMapping("/user/{userId}/this-month")
    public List<WorkoutSession> getByUserThisMonth(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return workoutSessionService.getByUserThisMonth(user);
    }

    // GET /api/workout-sessions/plan/{planId}
    @GetMapping("/plan/{planId}")
    public List<WorkoutSession> getSessionsByPlanId(@PathVariable Long planId) {
        WorkoutPlan plan = workoutPlanService.getWorkoutPlanById(planId);
        return workoutSessionService.getByWorkoutPlan(plan);
    }

    // POST /api/workout-sessions
    @PostMapping
    public ResponseEntity<WorkoutSession> createWorkoutSession(@Valid @RequestBody WorkoutSession workoutSession) {
        resolveReferences(workoutSession);
        WorkoutSession created = workoutSessionService.createWorkoutSession(workoutSession);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/workout-sessions/{id}
    @PutMapping("/{id}")
    public WorkoutSession updateWorkoutSession(@PathVariable Long id,
            @Valid @RequestBody WorkoutSession workoutSession) {
        resolveReferences(workoutSession);
        return workoutSessionService.updateWorkoutSession(id, workoutSession);
    }

    // DELETE /api/workout-sessions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutSession(@PathVariable Long id) {
        workoutSessionService.deleteWorkoutSession(id);
        return ResponseEntity.noContent().build();
    }

    // Ensure related entities exist, and attach managed entities before
    // save/update.
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
            WorkoutPlan plan = workoutPlanService.getWorkoutPlanById(planId);
            workoutSession.setWorkoutPlan(plan);
        }
    }
}
