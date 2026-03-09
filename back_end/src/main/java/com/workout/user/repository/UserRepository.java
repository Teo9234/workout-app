package com.workout.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workout.user.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // Check if a user already exists by username or email
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
