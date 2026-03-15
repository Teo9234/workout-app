package com.workout.core.exceptions;

import java.time.LocalDateTime;
import java.util.Map;

// record class to represent API error responses in a structured format
// I used a record here for immutability and concise syntax,
// as it is ideal for simple data carriers like this
public record ApiError(
                LocalDateTime timestamp,
                int status,
                String error,
                String message,
                String path,
                Map<String, String> fieldErrors) {
}
