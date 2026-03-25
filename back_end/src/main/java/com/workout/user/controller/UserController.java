package com.workout.user.controller;

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

import com.workout.user.dto.CreateWorkoutUserRequest;
import com.workout.user.dto.WorkoutUserResponse;
import com.workout.user.model.User;
import com.workout.user.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // Constructor injection for UserService
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users
    @GetMapping
    public List<WorkoutUserResponse> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get a user by ID
    @GetMapping("/{id}")
    public WorkoutUserResponse getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return mapToResponse(user);
    }

    // Create a new user
    @PostMapping
    public ResponseEntity<WorkoutUserResponse> createUser(
            @Valid @RequestBody CreateWorkoutUserRequest request) {
        User user = mapToEntity(request);
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(createdUser));
    }

    // Update an existing user
    @PutMapping("/{id}")
    public ResponseEntity<WorkoutUserResponse> updateUser(
            @PathVariable Long id, @Valid @RequestBody CreateWorkoutUserRequest request) {
        User user = mapToEntity(request);
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(mapToResponse(updatedUser));
    }

    // Delete a user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to convert CreateWorkoutUserRequest DTO to User entity
    private User mapToEntity(CreateWorkoutUserRequest request) {
        // only update the completed status if it's provided in the request
        if (request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Password cannot be blank");
        }
        return new User(
                request.username(),
                request.email(),
                request.password(),
                request.firstName(),
                request.lastName());

    }

    // Helper method to convert User entity to WorkoutUserResponse DTO
    private WorkoutUserResponse mapToResponse(User user) {
        return new WorkoutUserResponse(
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName());
    }
}
