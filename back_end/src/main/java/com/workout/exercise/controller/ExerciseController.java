package com.workout.exercise.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workout.exercise.dto.CreateExerciseRequest;
import com.workout.exercise.dto.ExerciseResponse;
import com.workout.exercise.model.Equipment;
import com.workout.exercise.model.Exercise;
import com.workout.exercise.model.MuscleGroup;
import com.workout.exercise.service.ExerciseService;

import jakarta.validation.Valid;

// @RestController tells Spring this class handles HTTP requests and returns JSON.
@RestController
// Base URL for all endpoints in this controller.
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    // Constructor injection: Spring provides ExerciseService automatically.
    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    // GET /api/exercises?muscleGroup=CHEST&equipment=DUMBBELL
    @GetMapping
    public List<ExerciseResponse> getExercises(
            @RequestParam(required = false) MuscleGroup muscleGroup,
            @RequestParam(required = false) Equipment equipment) {
        if (muscleGroup != null) {
            return exerciseService.getExercisesByMuscleGroup(muscleGroup).stream()
                    .map(this::mapExerciseToResponse)
                    .collect(Collectors.toList());
        }
        if (equipment != null) {
            return exerciseService.getExercisesByEquipment(equipment).stream()
                    .map(this::mapExerciseToResponse)
                    .collect(Collectors.toList());
        }
        return exerciseService.getAllExercises().stream()
                .map(this::mapExerciseToResponse)
                .collect(Collectors.toList());
    }

    // GET /api/exercises/{id}
    @GetMapping("/{id}")
    public ExerciseResponse getExerciseById(@PathVariable Long id) {
        return mapExerciseToResponse(exerciseService.getExerciseById(id));
    }

    // POST /api/exercises
    // @Valid triggers validation rules defined in CreateExerciseRequest.
    @PostMapping
    public ResponseEntity<ExerciseResponse> createExercise(@Valid @RequestBody CreateExerciseRequest request) {
        Exercise created = exerciseService.createExercise(mapRequestToExercise(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapExerciseToResponse(created));
    }

    // PUT /api/exercises/{id}
    @PutMapping("/{id}")
    public ExerciseResponse updateExercise(@PathVariable Long id, @Valid @RequestBody CreateExerciseRequest request) {
        Exercise updated = exerciseService.updateExercise(id, mapRequestToExercise(request));
        return mapExerciseToResponse(updated);
    }

    private Exercise mapRequestToExercise(CreateExerciseRequest request) {
        return new Exercise(
                request.name(),
                request.muscleGroup(),
                request.equipment(),
                request.description());
    }

    private ExerciseResponse mapExerciseToResponse(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getMuscleGroup(),
                exercise.getEquipment(),
                exercise.getDescription());
    }

    // DELETE /api/exercises/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }
}
