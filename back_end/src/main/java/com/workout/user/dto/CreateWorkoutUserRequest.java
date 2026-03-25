package com.workout.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWorkoutUserRequest(

        @NotBlank(message = "Username cannot be blank") @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters") String username,

        @NotBlank(message = "Email cannot be blank") @Size(min = 12, max = 30, message = "Email must be between 12 and 30 characters") @Email(message = "Email should be valid") String email,

        @NotBlank(message = "Password cannot be blank") @Size(min = 8, max = 20, message = "Password should be between 8 and 20 characters") String password,

        @NotBlank(message = "First name cannot be blank") @Size(min = 3, max = 20, message = "First name must be between 3 and 20 characters") String firstName,

        @NotBlank(message = "Last name cannot be blank") @Size(min = 3, max = 20, message = "Last name must be between 3 and 20 characters") String lastName) {

}
