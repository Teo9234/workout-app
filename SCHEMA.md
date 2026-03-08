# Workout App Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    EXERCISE ||--o{ WORKOUT_PLAN_EXERCISE : "has many"
    WORKOUT_PLAN ||--o{ WORKOUT_PLAN_EXERCISE : "has many"
    WORKOUT_PLAN ||--o{ WORKOUT_SESSION : "has many"
    WORKOUT_SESSION ||--o{ WORKOUT_SET : "has many"
    EXERCISE ||--o{ WORKOUT_SET : "has many"

    EXERCISE {
        long id
        string name
        enum muscleGroup
        enum equipment
        string description
        timestamp createdAt
        timestamp updatedAt
    }

    WORKOUT_PLAN {
        long id
        string name
        string description
        enum planType
        enum difficulty
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    WORKOUT_PLAN_EXERCISE {
        long id
        long workoutPlan_id FK
        long exercise_id FK
        int orderIndex
        int targetSets
        int targetReps
        int restSeconds
    }

    WORKOUT_SESSION {
        long id
        date sessionDate
        timestamp startTime
        timestamp endTime
        string notes
        long workoutPlan_id FK
        timestamp createdAt
        timestamp updatedAt
    }

    WORKOUT_SET {
        long id
        long workoutSession_id FK
        long exercise_id FK
        int setNumber
        int reps
        decimal weight
        int durationSeconds
        int rpe
        boolean completed
    }
```

## Relationships

- **Exercise**: Master list of all exercises
- **WorkoutPlan**: Reusable workout templates (Leg Day, Push Day, etc.)
- **WorkoutPlanExercise**: Connects exercises to plans with metadata (order, target reps, rest)
- **WorkoutSession**: Records one actual workout performed on a date
- **WorkoutSet**: Records each individual set completed in a session
