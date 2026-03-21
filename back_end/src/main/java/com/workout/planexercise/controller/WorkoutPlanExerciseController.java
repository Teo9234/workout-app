package com.workout.planexercise.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workout.plan.model.WorkoutPlan;
import com.workout.plan.service.WorkoutPlanService;
import com.workout.planexercise.dto.CreateWorkoutPlanExerciseRequest;
import com.workout.planexercise.dto.WorkoutPlanExerciseResponse;
import com.workout.planexercise.model.WorkoutPlanExercise;
import com.workout.planexercise.service.WorkoutPlanExerciseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/plan-exercises")
public class WorkoutPlanExerciseController {

    private final WorkoutPlanExerciseService planExerciseService;
    private final WorkoutPlanService workoutPlanService;

    // Constructor injection
    public WorkoutPlanExerciseController(WorkoutPlanExerciseService planExerciseService,
            WorkoutPlanService workoutPlanService) {
        this.planExerciseService = planExerciseService;
        this.workoutPlanService = workoutPlanService;
    }

    // Get all plan-exercise associations
    @GetMapping
    public List<WorkoutPlanExerciseResponse> getAllPlanExercises() {
        return planExerciseService.getAllWorkoutPlanExercises().stream()
                .map(e -> new WorkoutPlanExerciseResponse(
                        e.getId(),
                        e.getOrderIndex(),
                        e.getTargetSets(),
                        e.getTargetReps(),
                        e.getRestSeconds(),
                        e.getExercise().getName(),
                        e.getWorkoutPlan().getName()))
                .collect(Collectors.toList());
    }

    // Get a specific plan-exercise association by ID
    @GetMapping("/{id}")
    public WorkoutPlanExerciseResponse getPlanExerciseById(@PathVariable Long id) {
        WorkoutPlanExercise e = planExerciseService.getWorkoutPlanExerciseById(id);
        return new WorkoutPlanExerciseResponse(
                e.getId(),
                e.getOrderIndex(),
                e.getTargetSets(),
                e.getTargetReps(),
                e.getRestSeconds(),
                e.getExercise().getName(),
                e.getWorkoutPlan().getName());
    }

    // Get all exercises for a specific workout plan
    @GetMapping("/plan/{planId}")
    public List<WorkoutPlanExerciseResponse> getExercisesByPlanId(@PathVariable Long planId) {
        WorkoutPlan workoutPlan = workoutPlanService.getWorkoutPlanById(planId);
        return planExerciseService.getByWorkoutPlan(workoutPlan).stream()
                .map(e -> new WorkoutPlanExerciseResponse(
                        e.getId(),
                        e.getOrderIndex(),
                        e.getTargetSets(),
                        e.getTargetReps(),
                        e.getRestSeconds(),
                        e.getExercise().getName(),
                        e.getWorkoutPlan().getName()))
                .collect(Collectors.toList());
    }

    // Add an exercise to a workout plan
    @PostMapping("/plan/{planId}/exercise/{exerciseId}")
    public ResponseEntity<WorkoutPlanExerciseResponse> addExerciseToPlan(
            @PathVariable Long planId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody CreateWorkoutPlanExerciseRequest request) {
        WorkoutPlanExercise created = planExerciseService.createWorkoutPlanExercise(planId, exerciseId, request);

        // Map entity to response DTO
        WorkoutPlanExerciseResponse response = new WorkoutPlanExerciseResponse(
                created.getId(),
                created.getOrderIndex(),
                created.getTargetSets(),
                created.getTargetReps(),
                created.getRestSeconds(),
                created.getExercise().getName(),
                created.getWorkoutPlan().getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update an existing plan-exercise association
    @PutMapping("/plan/{planId}/exercise/{exerciseId}/{id}")
    public WorkoutPlanExerciseResponse updatePlanExercise(
            @PathVariable Long planId,
            @PathVariable Long exerciseId,
            @PathVariable Long id,
            @Valid @RequestBody CreateWorkoutPlanExerciseRequest request) {
        WorkoutPlanExercise updated = planExerciseService.updateWorkoutPlanExercise(id, planId, exerciseId, request);

        // Map entity to response DTO
        return new WorkoutPlanExerciseResponse(
                updated.getId(),
                updated.getOrderIndex(),
                updated.getTargetSets(),
                updated.getTargetReps(),
                updated.getRestSeconds(),
                updated.getExercise().getName(),
                updated.getWorkoutPlan().getName());
    }

    // Delete a plan-exercise association by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlanExercise(@PathVariable Long id) {
        planExerciseService.deleteWorkoutPlanExercise(id);
        return ResponseEntity.noContent().build();
    }
}
