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
import com.workout.session.dto.CreateWorkoutSessionRequest;
import com.workout.session.dto.WorkoutSessionResponse;
import com.workout.session.model.WorkoutSession;
import com.workout.session.service.WorkoutSessionService;
import com.workout.user.model.User;
import com.workout.user.service.UserService;

import jakarta.validation.Valid;

// REST controller for managing workout sessions. Provides endpoints for CRUD operations and querying sessions by user and date range.
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
    public List<WorkoutSessionResponse> getAllWorkoutSessions() {
        return workoutSessionService.getAllWorkoutSessions().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get a workout session by ID
    @GetMapping("/{id}")
    public WorkoutSessionResponse getWorkoutSessionById(@PathVariable Long id) {
        WorkoutSession workoutSession = workoutSessionService.getWorkoutSessionById(id);
        return mapToResponse(workoutSession);
    }

    // Get all workout sessions for a user
    // For example, GET /api/workout-sessions/user/123 would return all sessions for
    // user with ID 123
    @GetMapping("/user/{userId}")
    public List<WorkoutSessionResponse> getWorkoutSessionsByUser(@PathVariable Long userId) {
        return workoutSessionService.getByUser(userService.getUserById(userId)).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get workout sessions for a user between two dates
    @GetMapping("/user/{userId}/between")
    public List<WorkoutSessionResponse> getWorkoutSessionsByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = userService.getUserById(userId);
        return workoutSessionService.getByUserAndDateRange(user, startDate, endDate).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get workout sessions for a user in the current month (useful for stats)
    @GetMapping("/user/{userId}/this-month")
    public List<WorkoutSessionResponse> getWorkoutSessionsByUserThisMonth(@PathVariable Long userId) {
        return workoutSessionService.getByUserThisMonth(userService.getUserById(userId)).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Create a new workout session. Note: No {userId} in the path because the user
    // is included in the request body.
    @PostMapping
    public ResponseEntity<WorkoutSessionResponse> createWorkoutSession(
            @Valid @RequestBody CreateWorkoutSessionRequest workoutSessionRequest) {
        WorkoutSession workoutSession = mapToEntity(workoutSessionRequest);
        WorkoutSession createdSession = workoutSessionService.createWorkoutSession(workoutSession);
        WorkoutSessionResponse response = mapToResponse(createdSession);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update an existing workout session by ID
    @PutMapping("/{id}")
    public ResponseEntity<WorkoutSessionResponse> updateWorkoutSession(@PathVariable Long id,
            @Valid @RequestBody CreateWorkoutSessionRequest workoutSessionRequest) {
        WorkoutSession workoutSession = mapToEntity(workoutSessionRequest);
        WorkoutSession updatedSession = workoutSessionService.updateWorkoutSession(id, workoutSession);
        WorkoutSessionResponse response = mapToResponse(updatedSession);
        return ResponseEntity.ok(response);
    }

    // Delete a workout session by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutSession(@PathVariable Long id) {
        workoutSessionService.deleteWorkoutSession(id);
        return ResponseEntity.noContent().build();
    }

    private WorkoutSession mapToEntity(CreateWorkoutSessionRequest request) {
        User user = userService.getUserById(request.userId());

        WorkoutSession workoutSession;
        if (request.workoutPlanId() != null) {
            WorkoutPlan workoutPlan = workoutPlanService.getWorkoutPlanById(request.workoutPlanId());
            workoutSession = new WorkoutSession(user, request.sessionDate(), workoutPlan);
        } else {
            workoutSession = new WorkoutSession(user, request.sessionDate());
        }

        workoutSession.setStartTime(request.startTime());
        workoutSession.setEndTime(request.endTime());
        workoutSession.setNotes(request.notes());

        return workoutSession;
    }

    private WorkoutSessionResponse mapToResponse(WorkoutSession workoutSession) {
        return new WorkoutSessionResponse(
                workoutSession.getId(),
                workoutSession.getUser().getId(),
                workoutSession.getSessionDate(),
                workoutSession.getStartTime(),
                workoutSession.getEndTime(),
                workoutSession.getNotes(),
                workoutSession.getWorkoutPlan() != null ? workoutSession.getWorkoutPlan().getId() : null);
    }
}