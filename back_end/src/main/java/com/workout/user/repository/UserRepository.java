package com.workout.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.user.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by username
    Optional<User> findByUsername(String username);

    // Find a user by email. Optional is used to handle the case where no user is
    // found with the given email.
    Optional<User> findByEmail(String email);

    // Check if a user already exists by username or email
    boolean existsByUsername(String username);

    // Check if a user already exists by email
    boolean existsByEmail(String email);
}
