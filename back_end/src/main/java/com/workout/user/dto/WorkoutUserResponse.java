package com.workout.user.dto;

public record WorkoutUserResponse(

        Long id,
        String username,
        String email,
        String firstName,
        String lastName

) {

}
