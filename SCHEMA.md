# Workout App Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ WORKOUT_PLAN : "owns"
    USER ||--o{ WORKOUT_SESSION : "owns"
    EXERCISE ||--o{ WORKOUT_PLAN_EXERCISE : "has many"
    WORKOUT_PLAN ||--o{ WORKOUT_PLAN_EXERCISE : "has many"
    WORKOUT_PLAN ||--o{ WORKOUT_SESSION : "has many"
    WORKOUT_SESSION ||--o{ WORKOUT_SET : "has many"
    EXERCISE ||--o{ WORKOUT_SET : "has many"

    USER {
        long id
        string username
        string email
        string password
        string firstName
        string lastName
        timestamp createdAt
        timestamp updatedAt
    }

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
        long user_id FK
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
        long user_id FK
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

- **User**: Application users who own workout plans and sessions
- **Exercise**: Master list of all exercises
- **WorkoutPlan**: Reusable workout templates (Leg Day, Push Day, etc.) owned by users
- **WorkoutPlanExercise**: Connects exercises to plans with metadata (order, target reps, rest)
- **WorkoutSession**: Records one actual workout performed on a date by a user
- **WorkoutSet**: Records each individual set completed in a session
