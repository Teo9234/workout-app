package com.workout.exercise.controller;

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
    public List<Exercise> getExercises(
            @RequestParam(required = false) MuscleGroup muscleGroup,
            @RequestParam(required = false) Equipment equipment) {
        if (muscleGroup != null) {
            return exerciseService.getExercisesByMuscleGroup(muscleGroup);
        }
        if (equipment != null) {
            return exerciseService.getExercisesByEquipment(equipment);
        }
        return exerciseService.getAllExercises();
    }

    // GET /api/exercises/{id}
    @GetMapping("/{id}")
    public Exercise getExerciseById(@PathVariable Long id) {
        return exerciseService.getExerciseById(id);
    }

    // POST /api/exercises
    // @Valid triggers bean validation annotations in the Exercise model.
    @PostMapping
    public ResponseEntity<Exercise> createExercise(@Valid @RequestBody Exercise exercise) {
        Exercise created = exerciseService.createExercise(exercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/exercises/{id}
    @PutMapping("/{id}")
    public Exercise updateExercise(@PathVariable Long id, @Valid @RequestBody Exercise exercise) {
        return exerciseService.updateExercise(id, exercise);
    }

    // DELETE /api/exercises/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }
}
