package com.workout.plan.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workout.plan.model.WorkoutPlan;
import com.workout.plan.repository.WorkoutPlanRepository;
import com.workout.plan.model.PlanDifficulty;
import com.workout.plan.model.WorkoutPlanType;

@Service
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;

    // Constructor injection of the repository
    public WorkoutPlanService(WorkoutPlanRepository workoutPlanRepository) {
        this.workoutPlanRepository = workoutPlanRepository;
    }

    // Get all workout plans
    public List<WorkoutPlan> getAllWorkoutPlans() {
        return workoutPlanRepository.findAll();
    }

    // Get a single workout plan by id
    public WorkoutPlan getWorkoutPlanById(Long id) {
        // findById returns Optional; throw when the record does not exist.
        return workoutPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout plan not found with id: " + id));
    }

    // Get workout plans by type
    public List<WorkoutPlan> getWorkoutPlansByType(WorkoutPlanType type) {
        return workoutPlanRepository.findByPlanType(type);
    }

    // Get workout plans by difficulty
    public List<WorkoutPlan> getWorkoutPlansByDifficulty(PlanDifficulty difficulty) {
        return workoutPlanRepository.findByDifficulty(difficulty);
    }

    // Create a new workout plan
    public WorkoutPlan createWorkoutPlan(WorkoutPlan workoutPlan) {
        return workoutPlanRepository.save(workoutPlan);
    }

    // Update an existing workout plan
    public WorkoutPlan updateWorkoutPlan(Long id, WorkoutPlan updatedWorkoutPlan) {
        // Load the existing row first so JPA updates this record instead of creating a
        // new one.
        WorkoutPlan existing = getWorkoutPlanById(id);
        existing.setName(updatedWorkoutPlan.getName());
        existing.setPlanType(updatedWorkoutPlan.getPlanType());
        existing.setDifficulty(updatedWorkoutPlan.getDifficulty());
        existing.setDescription(updatedWorkoutPlan.getDescription());
        return workoutPlanRepository.save(existing);
    }

    // Delete a workout plan
    public void deleteWorkoutPlan(Long id) {
        WorkoutPlan existing = getWorkoutPlanById(id);
        workoutPlanRepository.delete(existing);
    }

}
