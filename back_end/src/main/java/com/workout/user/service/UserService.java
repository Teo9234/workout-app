package com.workout.user.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workout.core.exceptions.ResourceNotFoundException;
import com.workout.user.model.User;
import com.workout.user.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor injection: Spring provides UserRepository automatically.
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get one user by id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    // Get one user by username
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    // Get one user by email
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    // Create a user with uniqueness checks
    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    // Update an existing user
    public User updateUser(Long id, User updatedUser) {
        User existing = getUserById(id);

        // Only enforce uniqueness when username/email is actually changing.
        if (!existing.getUsername().equals(updatedUser.getUsername())
                && userRepository.existsByUsername(updatedUser.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + updatedUser.getUsername());
        }

        if (!existing.getEmail().equals(updatedUser.getEmail())
                && userRepository.existsByEmail(updatedUser.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + updatedUser.getEmail());
        }

        existing.setUsername(updatedUser.getUsername());
        existing.setEmail(updatedUser.getEmail());
        existing.setPassword(updatedUser.getPassword());
        existing.setFirstName(updatedUser.getFirstName());
        existing.setLastName(updatedUser.getLastName());
        return userRepository.save(existing);
    }

    // Delete a user by id
    public void deleteUser(Long id) {
        User existing = getUserById(id);
        userRepository.delete(existing);
    }
}
