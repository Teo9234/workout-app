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
import com.workout.session.dto.CreateWorkoutSetRequest;
import com.workout.session.dto.WorkoutSetResponse;
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
    public List<WorkoutSetResponse> getAllWorkoutSets() {
        return workoutSetService.getAllWorkoutSets().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get a workout set by ID
    @GetMapping("/{id}")
    public WorkoutSetResponse getWorkoutSetById(@PathVariable Long id) {
        WorkoutSet workoutSet = workoutSetService.getWorkoutSetById(id);
        return mapToResponse(workoutSet);
    }

    // Get all workout sets for a specific workout session
    @GetMapping("/session/{sessionId}")
    public List<WorkoutSetResponse> getByWorkoutSession(@PathVariable Long sessionId) {
        WorkoutSession session = workoutSessionService.getWorkoutSessionById(sessionId);
        return workoutSetService.getByWorkoutSession(session).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Create a new workout set for a specific workout session and exercise
    @PostMapping("/session/{sessionId}/exercise/{exerciseId}")
    public ResponseEntity<WorkoutSetResponse> createWorkoutSet(
            @PathVariable Long sessionId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody CreateWorkoutSetRequest request) {
        WorkoutSet workoutSet = mapToEntity(request, sessionId, exerciseId);
        WorkoutSet createdSet = workoutSetService.createWorkoutSet(workoutSet);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(createdSet));
    }

    // Update an existing workout set
    @PutMapping("/session/{sessionId}/exercise/{exerciseId}/set/{id}")
    public WorkoutSetResponse updateWorkoutSet(
            @PathVariable Long sessionId,
            @PathVariable Long exerciseId,
            @PathVariable Long id,
            @Valid @RequestBody CreateWorkoutSetRequest request) {
        WorkoutSet workoutSet = mapToEntity(request, sessionId, exerciseId);
        WorkoutSet updatedSet = workoutSetService.updateWorkoutSet(id, workoutSet);
        return mapToResponse(updatedSet);
    }

    // Delete a workout set by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutSet(@PathVariable Long id) {
        workoutSetService.deleteWorkoutSet(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to convert CreateWorkoutSetRequest DTO to WorkoutSet entity
    private WorkoutSet mapToEntity(CreateWorkoutSetRequest request, Long sessionId, Long exerciseId) {
        WorkoutSession session = workoutSessionService.getWorkoutSessionById(sessionId);
        WorkoutSet workoutSet = new WorkoutSet(
                session,
                exerciseService.getExerciseById(exerciseId),
                request.setNumber());

        workoutSet.setReps(request.reps());
        workoutSet.setWeight(request.weight());
        workoutSet.setDurationSeconds(request.durationSeconds());
        workoutSet.setRpe(request.rpe());
        // Only update the completed status if it's provided in the request
        if (request.completed() != null) {
            workoutSet.setCompleted(request.completed());
        }
        return workoutSet;
    }

    // Helper method to convert WorkoutSet entity to WorkoutSetResponse DTO
    private WorkoutSetResponse mapToResponse(WorkoutSet workoutSet) {
        return new WorkoutSetResponse(
                workoutSet.getId(),
                workoutSet.getWorkoutSession().getId(),
                workoutSet.getExercise().getId(),
                workoutSet.getSetNumber(),
                workoutSet.getReps(),
                workoutSet.getWeight(),
                workoutSet.getDurationSeconds(),
                workoutSet.getRpe(),
                workoutSet.getCompleted());
    }
}
