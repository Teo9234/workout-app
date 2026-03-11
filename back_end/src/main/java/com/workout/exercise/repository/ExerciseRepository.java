package com.workout.exercise.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.exercise.model.Equipment;
import com.workout.exercise.model.Exercise;
import com.workout.exercise.model.MuscleGroup;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    // Find an exercise by name, ignoring case
    Optional<Exercise> findByNameIgnoreCase(String name);

    // Find exercises by muscle group
    List<Exercise> findByMuscleGroup(MuscleGroup muscleGroup);

    // Find exercises by equipment
    List<Exercise> findByEquipment(Equipment equipment);
}