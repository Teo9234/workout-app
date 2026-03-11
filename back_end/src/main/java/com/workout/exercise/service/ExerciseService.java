package com.workout.exercise.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workout.core.exceptions.ResourceNotFoundException;
import com.workout.exercise.model.Equipment;
import com.workout.exercise.model.Exercise;
import com.workout.exercise.model.MuscleGroup;
import com.workout.exercise.repository.ExerciseRepository;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    // Constructor injection of the repository
    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    // Get all exercises
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    // Get a single exercise by id
    public Exercise getExerciseById(Long id) {
        // findById returns Optional; throw when the record does not exist.
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    }

    // Get exercises by muscle group
    public List<Exercise> getExercisesByMuscleGroup(MuscleGroup muscleGroup) {
        return exerciseRepository.findByMuscleGroup(muscleGroup);
    }

    // Get exercises by equipment
    public List<Exercise> getExercisesByEquipment(Equipment equipment) {
        return exerciseRepository.findByEquipment(equipment);
    }

    // Create a new exercise
    public Exercise createExercise(Exercise exercise) {
        return exerciseRepository.save(exercise);
    }

    // Update an existing exercise
    public Exercise updateExercise(Long id, Exercise updatedExercise) {
        // Load the existing row first so JPA updates this record instead of creating a
        // new one.
        Exercise existing = getExerciseById(id);
        existing.setName(updatedExercise.getName());
        existing.setMuscleGroup(updatedExercise.getMuscleGroup());
        existing.setEquipment(updatedExercise.getEquipment());
        existing.setDescription(updatedExercise.getDescription());
        return exerciseRepository.save(existing);
    }

    // Delete an exercise
    public void deleteExercise(Long id) {
        Exercise existing = getExerciseById(id);
        exerciseRepository.delete(existing);
    }
}
