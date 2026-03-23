package com.workout.plan.controller;

import java.util.List;

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

import com.workout.plan.dto.CreateWorkoutPlanRequest;
import com.workout.plan.dto.WorkoutPlanResponse;
import com.workout.plan.model.PlanDifficulty;
import com.workout.plan.model.WorkoutPlan;
import com.workout.plan.model.WorkoutPlanType;
import com.workout.plan.service.WorkoutPlanService;

import jakarta.validation.Valid;

// @RestController tells Spring this class handles HTTP requests and returns JSON.
@RestController
// Base URL for all endpoints in this controller.
@RequestMapping("/api/workout-plans")
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    // Constructor injection: Spring provides WorkoutPlanService automatically.
    public WorkoutPlanController(WorkoutPlanService workoutPlanService) {
        this.workoutPlanService = workoutPlanService;
    }

    // GET /api/workout-plans?type=PUSH or ?difficulty=BEGINNER
    @GetMapping
    public List<WorkoutPlanResponse> getWorkoutPlans(
            @RequestParam(required = false) WorkoutPlanType type,
            @RequestParam(required = false) PlanDifficulty difficulty) {
        if (type != null) {
            return workoutPlanService.getWorkoutPlansByType(type).stream()
                    .map(this::mapWorkoutPlanToResponse)
                    .toList();
        }
        if (difficulty != null) {
            return workoutPlanService.getWorkoutPlansByDifficulty(difficulty).stream()
                    .map(this::mapWorkoutPlanToResponse)
                    .toList();
        }
        return workoutPlanService.getAllWorkoutPlans().stream()
                .map(this::mapWorkoutPlanToResponse)
                .toList();
    }

    // GET /api/workout-plans/active
    @GetMapping("/active")
    public List<WorkoutPlanResponse> getActiveWorkoutPlans() {
        return workoutPlanService.getActiveWorkoutPlans().stream()
                .map(this::mapWorkoutPlanToResponse)
                .toList();
    }

    // GET /api/workout-plans/{id}
    @GetMapping("/{id}")
    public WorkoutPlanResponse getWorkoutPlanById(@PathVariable Long id) {
        return mapWorkoutPlanToResponse(workoutPlanService.getWorkoutPlanById(id));
    }

    // POST /api/workout-plans
    @PostMapping
    public ResponseEntity<WorkoutPlanResponse> createWorkoutPlan(@Valid @RequestBody CreateWorkoutPlanRequest request) {
        WorkoutPlan created = workoutPlanService.createWorkoutPlan(mapRequestToWorkoutPlan(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapWorkoutPlanToResponse(created));
    }

    // PUT /api/workout-plans/{id}
    @PutMapping("/{id}")
    public WorkoutPlanResponse updateWorkoutPlan(@PathVariable Long id,
            @Valid @RequestBody CreateWorkoutPlanRequest request) {
        WorkoutPlan updated = workoutPlanService.updateWorkoutPlan(id, mapRequestToWorkoutPlan(request));
        return mapWorkoutPlanToResponse(updated);
    }

    // DELETE /api/workout-plans/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutPlan(@PathVariable Long id) {
        workoutPlanService.deleteWorkoutPlan(id);
        return ResponseEntity.noContent().build();
    }

    private WorkoutPlan mapRequestToWorkoutPlan(CreateWorkoutPlanRequest request) {
        WorkoutPlan workoutPlan = new WorkoutPlan(
                request.name(),
                request.description(),
                request.planType(),
                request.difficulty());

        if (request.active() != null) {
            workoutPlan.setActive(request.active());
        }

        return workoutPlan;
    }

    private WorkoutPlanResponse mapWorkoutPlanToResponse(WorkoutPlan workoutPlan) {
        return new WorkoutPlanResponse(
                workoutPlan.getId(),
                workoutPlan.getName(),
                workoutPlan.getDescription(),
                workoutPlan.getPlanType(),
                workoutPlan.getDifficulty(),
                workoutPlan.isActive());
    }
}
