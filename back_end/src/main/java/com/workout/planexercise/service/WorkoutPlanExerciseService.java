package com.workout.planexercise.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workout.core.exceptions.ResourceNotFoundException;
import com.workout.exercise.model.Exercise;
import com.workout.exercise.service.ExerciseService;
import com.workout.plan.model.WorkoutPlan;
import com.workout.plan.service.WorkoutPlanService;
import com.workout.planexercise.dto.CreateWorkoutPlanExerciseRequest;
import com.workout.planexercise.model.WorkoutPlanExercise;
import com.workout.planexercise.repository.WorkoutPlanExerciseRepository;

@Service
public class WorkoutPlanExerciseService {

    private final WorkoutPlanExerciseRepository workoutPlanExerciseRepository;
    private final WorkoutPlanService workoutPlanService;
    private final ExerciseService exerciseService;

    // Constructor injection: Spring provides dependencies automatically.
    public WorkoutPlanExerciseService(WorkoutPlanExerciseRepository workoutPlanExerciseRepository,
            WorkoutPlanService workoutPlanService,
            ExerciseService exerciseService) {
        this.workoutPlanExerciseRepository = workoutPlanExerciseRepository;
        this.workoutPlanService = workoutPlanService;
        this.exerciseService = exerciseService;
    }

    // Get all join rows
    public List<WorkoutPlanExercise> getAllWorkoutPlanExercises() {
        return workoutPlanExerciseRepository.findAll();
    }

    // Get one join row by id
    public WorkoutPlanExercise getWorkoutPlanExerciseById(Long id) {
        return workoutPlanExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlanExercise", "id", id));
    }

    // Get ordered exercise list for a workout plan
    public List<WorkoutPlanExercise> getByWorkoutPlan(WorkoutPlan workoutPlan) {
        return workoutPlanExerciseRepository.findByWorkoutPlanOrderByOrderIndexAsc(workoutPlan);
    }

    // Get a specific exercise inside a specific plan
    public WorkoutPlanExercise getByWorkoutPlanAndExercise(WorkoutPlan workoutPlan, Exercise exercise) {
        WorkoutPlanExercise result = workoutPlanExerciseRepository.findByWorkoutPlanAndExercise(workoutPlan, exercise);
        if (result == null) {
            throw new ResourceNotFoundException(
                    "WorkoutPlanExercise",
                    "workoutPlan/exercise",
                    workoutPlan.getId() + "/" + exercise.getId());
        }
        return result;
    }

    // Create a join row for POST /plan/{planId}/exercise/{exerciseId}
    public WorkoutPlanExercise createWorkoutPlanExercise(Long planId, Long exerciseId,
            CreateWorkoutPlanExerciseRequest request) {
        WorkoutPlan workoutPlan = workoutPlanService.getWorkoutPlanById(planId);
        Exercise exercise = exerciseService.getExerciseById(exerciseId);

        if (workoutPlanExerciseRepository.existsByWorkoutPlanAndOrderIndex(workoutPlan, request.orderIndex())) {
            throw new IllegalArgumentException(
                    "Order index " + request.orderIndex() + " is already used in workout plan " + workoutPlan.getId());
        }

        WorkoutPlanExercise workoutPlanExercise = new WorkoutPlanExercise(
                workoutPlan,
                exercise,
                request.orderIndex(),
                request.targetSets(),
                request.targetReps(),
                request.restSeconds());

        return workoutPlanExerciseRepository.save(workoutPlanExercise);
    }

    // Update a join row
    public WorkoutPlanExercise updateWorkoutPlanExercise(Long id, Long planId, Long exerciseId,
            CreateWorkoutPlanExerciseRequest request) {
        WorkoutPlanExercise existing = getWorkoutPlanExerciseById(id);

        WorkoutPlan workoutPlan = workoutPlanService.getWorkoutPlanById(planId);
        Exercise exercise = exerciseService.getExerciseById(exerciseId);

        if (workoutPlanExerciseRepository.existsByWorkoutPlanAndOrderIndexAndIdNot(
                workoutPlan,
                request.orderIndex(),
                id)) {
            throw new IllegalArgumentException(
                    "Order index " + request.orderIndex() + " is already used in workout plan " + workoutPlan.getId());
        }

        existing.setWorkoutPlan(workoutPlan);
        existing.setExercise(exercise);
        existing.setOrderIndex(request.orderIndex());
        existing.setTargetSets(request.targetSets());
        existing.setTargetReps(request.targetReps());
        existing.setRestSeconds(request.restSeconds());
        return workoutPlanExerciseRepository.save(existing);
    }

    // Delete a join row
    public void deleteWorkoutPlanExercise(Long id) {
        WorkoutPlanExercise existing = getWorkoutPlanExerciseById(id);
        workoutPlanExerciseRepository.delete(existing);
    }

    // Count exercises in a workout plan
    public long countByWorkoutPlan(WorkoutPlan workoutPlan) {
        return workoutPlanExerciseRepository.countByWorkoutPlan(workoutPlan);
    }
}
