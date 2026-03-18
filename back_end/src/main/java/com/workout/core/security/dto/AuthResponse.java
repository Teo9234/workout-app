package com.workout.core.security.dto;

public record AuthResponse(String tokenType, String accessToken) {
}
