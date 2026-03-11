package com.workout.session.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workout.core.exceptions.ResourceNotFoundException;
import com.workout.exercise.model.Exercise;
import com.workout.session.model.WorkoutSet;
import com.workout.session.model.WorkoutSession;
import com.workout.session.repository.WorkoutSetRepository;

@Service
public class WorkoutSetService {

    private final WorkoutSetRepository workoutSetRepository;

    // Constructor injection: Spring provides WorkoutSetRepository automatically.
    public WorkoutSetService(WorkoutSetRepository workoutSetRepository) {
        this.workoutSetRepository = workoutSetRepository;
    }

    // Get all sets
    public List<WorkoutSet> getAllWorkoutSets() {
        return workoutSetRepository.findAll();
    }

    // Get one set by id
    public WorkoutSet getWorkoutSetById(Long id) {
        return workoutSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutSet", "id", id));
    }

    // Get all sets in one session in order
    public List<WorkoutSet> getByWorkoutSession(WorkoutSession workoutSession) {
        return workoutSetRepository.findByWorkoutSessionOrderBySetNumberAsc(workoutSession);
    }

    // Get sets in one session for a specific exercise
    public List<WorkoutSet> getByWorkoutSessionAndExercise(WorkoutSession workoutSession, Exercise exercise) {
        return workoutSetRepository.findByWorkoutSessionAndExercise(workoutSession, exercise);
    }

    // Get completed sets in one session
    public List<WorkoutSet> getCompletedByWorkoutSession(WorkoutSession workoutSession) {
        return workoutSetRepository.findByWorkoutSessionAndCompletedTrue(workoutSession);
    }

    // Get incomplete sets in one session
    public List<WorkoutSet> getIncompleteByWorkoutSession(WorkoutSession workoutSession) {
        return workoutSetRepository.findByWorkoutSessionAndCompletedFalse(workoutSession);
    }

    // Create a set
    public WorkoutSet createWorkoutSet(WorkoutSet workoutSet) {
        return workoutSetRepository.save(workoutSet);
    }

    // Update a set
    public WorkoutSet updateWorkoutSet(Long id, WorkoutSet updatedWorkoutSet) {
        WorkoutSet existing = getWorkoutSetById(id);
        existing.setWorkoutSession(updatedWorkoutSet.getWorkoutSession());
        existing.setExercise(updatedWorkoutSet.getExercise());
        existing.setSetNumber(updatedWorkoutSet.getSetNumber());
        existing.setReps(updatedWorkoutSet.getReps());
        existing.setWeight(updatedWorkoutSet.getWeight());
        existing.setDurationSeconds(updatedWorkoutSet.getDurationSeconds());
        existing.setRpe(updatedWorkoutSet.getRpe());
        existing.setCompleted(updatedWorkoutSet.getCompleted());
        return workoutSetRepository.save(existing);
    }

    // Delete a set
    public void deleteWorkoutSet(Long id) {
        WorkoutSet existing = getWorkoutSetById(id);
        workoutSetRepository.delete(existing);
    }

    // Count all sets in one session
    public long countByWorkoutSession(WorkoutSession workoutSession) {
        return workoutSetRepository.countByWorkoutSession(workoutSession);
    }

    // Count completed sets in one session
    public long countCompletedByWorkoutSession(WorkoutSession workoutSession) {
        return workoutSetRepository.countByWorkoutSessionAndCompletedTrue(workoutSession);
    }
}
