package com.workout.planexercise.controller;

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
import org.springframework.web.bind.annotation.RestController;

import com.workout.plan.model.WorkoutPlan;
import com.workout.plan.service.WorkoutPlanService;
import com.workout.planexercise.dto.CreateWorkoutPlanExerciseRequest;
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
    public List<WorkoutPlanExercise> getAllPlanExercises() {
        return planExerciseService.getAllWorkoutPlanExercises();
    }

    // Get a specific plan-exercise association by ID
    @GetMapping("/{id}")
    public WorkoutPlanExercise getPlanExerciseById(@PathVariable Long id) {
        return planExerciseService.getWorkoutPlanExerciseById(id);
    }

    // Get all exercises for a specific workout plan
    @GetMapping("/plan/{planId}")
    public List<WorkoutPlanExercise> getExercisesByPlanId(@PathVariable Long planId) {
        WorkoutPlan workoutPlan = workoutPlanService.getWorkoutPlanById(planId);
        return planExerciseService.getByWorkoutPlan(workoutPlan);
    }

    // Add an exercise to a workout plan
    @PostMapping("/plan/{planId}/exercise/{exerciseId}")
    public ResponseEntity<WorkoutPlanExercise> addExerciseToPlan(
            @PathVariable Long planId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody CreateWorkoutPlanExerciseRequest request) {
        WorkoutPlanExercise created = planExerciseService.createWorkoutPlanExercise(planId, exerciseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Update an existing plan-exercise association
    @PutMapping("/plan/{planId}/exercise/{exerciseId}/{id}")
    public WorkoutPlanExercise updatePlanExercise(
            @PathVariable Long planId,
            @PathVariable Long exerciseId,
            @PathVariable Long id,
            @Valid @RequestBody CreateWorkoutPlanExerciseRequest request) {
        return planExerciseService.updateWorkoutPlanExercise(id, planId, exerciseId, request);
    }

    // Delete a plan-exercise association by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlanExercise(@PathVariable Long id) {
        planExerciseService.deleteWorkoutPlanExercise(id);
        return ResponseEntity.noContent().build();
    }
}
