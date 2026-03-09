package com.workout.exercise.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.exercise.model.Exercise;
import com.workout.exercise.model.MuscleGroup;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    Optional<Exercise> findByNameIgnoreCase(String name);

    List<Exercise> findByMuscleGroup(MuscleGroup muscleGroup);
}