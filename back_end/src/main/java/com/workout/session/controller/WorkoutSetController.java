package com.workout.session.controller;

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

import com.workout.exercise.service.ExerciseService;
import com.workout.session.model.WorkoutSession;
import com.workout.session.model.WorkoutSet;
import com.workout.session.service.WorkoutSessionService;
import com.workout.session.service.WorkoutSetService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workout-sets")
public class WorkoutSetController {

    private final WorkoutSetService workoutSetService;
    private final WorkoutSessionService workoutSessionService;
    private final ExerciseService exerciseService;

    // Constructor injection
    public WorkoutSetController(WorkoutSetService workoutSetService, WorkoutSessionService workoutSessionService,
            ExerciseService exerciseService) {
        this.workoutSetService = workoutSetService;
        this.workoutSessionService = workoutSessionService;
        this.exerciseService = exerciseService;
    }

    // Get all workout sets
    @GetMapping
    public List<WorkoutSet> getAllWorkoutSets() {
        return workoutSetService.getAllWorkoutSets();
    }

    // Get a workout set by ID
    @GetMapping("/{id}")
    public WorkoutSet getWorkoutSetById(@PathVariable Long id) {
        return workoutSetService.getWorkoutSetById(id);
    }

    // Get all workout sets for a specific workout session
    @GetMapping("/session/{sessionId}")
    public List<WorkoutSet> getByWorkoutSession(@PathVariable Long sessionId) {
        WorkoutSession session = workoutSessionService.getWorkoutSessionById(sessionId);
        return workoutSetService.getByWorkoutSession(session);
    }

    // Create a new workout set for a specific workout session and exercise
    @PostMapping("/session/{sessionId}/exercise/{exerciseId}")
    public ResponseEntity<WorkoutSet> createWorkoutSet(
            @PathVariable Long sessionId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody WorkoutSet workoutSet) {

        WorkoutSession session = workoutSessionService.getWorkoutSessionById(sessionId);
        workoutSet.setWorkoutSession(session);
        workoutSet.setExercise(exerciseService.getExerciseById(exerciseId));

        WorkoutSet createdSet = workoutSetService.createWorkoutSet(workoutSet);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSet);
    }

    // Update an existing workout set
    @PutMapping("/session/{sessionId}/exercise/{exerciseId}/set/{id}")
    public WorkoutSet updateWorkoutSet(
            @PathVariable Long sessionId,
            @PathVariable Long exerciseId,
            @PathVariable Long id,
            @Valid @RequestBody WorkoutSet workoutSet) {

        WorkoutSession session = workoutSessionService.getWorkoutSessionById(sessionId);
        workoutSet.setWorkoutSession(session);
        workoutSet.setExercise(exerciseService.getExerciseById(exerciseId));
        return workoutSetService.updateWorkoutSet(id, workoutSet);
    }

    // Delete a workout set by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutSet(@PathVariable Long id) {
        workoutSetService.deleteWorkoutSet(id);
        return ResponseEntity.noContent().build();
    }

}
