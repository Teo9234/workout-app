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
    public List<WorkoutPlan> getWorkoutPlans(
            @RequestParam(required = false) WorkoutPlanType type,
            @RequestParam(required = false) PlanDifficulty difficulty) {
        if (type != null) {
            return workoutPlanService.getWorkoutPlansByType(type);
        }
        if (difficulty != null) {
            return workoutPlanService.getWorkoutPlansByDifficulty(difficulty);
        }
        return workoutPlanService.getAllWorkoutPlans();
    }

    // GET /api/workout-plans/active
    @GetMapping("/active")
    public List<WorkoutPlan> getActiveWorkoutPlans() {
        return workoutPlanService.getActiveWorkoutPlans();
    }

    // GET /api/workout-plans/{id}
    @GetMapping("/{id}")
    public WorkoutPlan getWorkoutPlanById(@PathVariable Long id) {
        return workoutPlanService.getWorkoutPlanById(id);
    }

    // POST /api/workout-plans
    @PostMapping
    public ResponseEntity<WorkoutPlan> createWorkoutPlan(@Valid @RequestBody WorkoutPlan workoutPlan) {
        WorkoutPlan created = workoutPlanService.createWorkoutPlan(workoutPlan);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/workout-plans/{id}
    @PutMapping("/{id}")
    public WorkoutPlan updateWorkoutPlan(@PathVariable Long id, @Valid @RequestBody WorkoutPlan workoutPlan) {
        return workoutPlanService.updateWorkoutPlan(id, workoutPlan);
    }

    // DELETE /api/workout-plans/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutPlan(@PathVariable Long id) {
        workoutPlanService.deleteWorkoutPlan(id);
        return ResponseEntity.noContent().build();
    }
}
