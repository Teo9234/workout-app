import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, concatMap, defaultIfEmpty, forkJoin, map, of } from 'rxjs';

interface SessionResponse {
  id: number;
}

interface FindOrCreateExerciseResponse {
  id: number;
}

export interface WorkoutPlanResponse {
  id: number;
  name: string;
  description: string;
  planType: string;
  difficulty: string;
  active: boolean;
}

export interface PlanExerciseResponse {
  id: number;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  exerciseName: string;
  planName: string;
}

export interface ExerciseCatalogItem {
  id: number;
  name: string;
  muscleGroup: string;
  equipment: string;
  description: string | null;
}

export interface WorkoutSessionSummary {
  id: number;
  userId: number;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  workoutPlanId: number | null;
  restDay: boolean;
}

export interface WorkoutSetDetail {
  id: number;
  workoutSessionId: number;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
  rpe: number | null;
  completed: boolean;
}

export interface UpdateWorkoutSessionRequest {
  userId: number;
  sessionDate: string;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
  workoutPlanId?: number | null;
  restDay?: boolean;
}

export interface UpdateWorkoutSetRequest {
  setNumber: number;
  reps?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  rpe?: number | null;
  completed?: boolean;
}

export interface ExerciseToSave {
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: number;
  weight: number;
  durationMinutes: number;
  rpe: number;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkoutApiService {

  private readonly base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getSessionsBetween(
    userId: number,
    startDate: string,
    endDate: string,
  ): Observable<WorkoutSessionSummary[]> {
    return this.http.get<WorkoutSessionSummary[]>(
      `${this.base}/workout-sessions/user/${userId}/between?startDate=${startDate}&endDate=${endDate}`,
    );
  }

  getAllSessions(userId: number): Observable<WorkoutSessionSummary[]> {
    return this.http.get<WorkoutSessionSummary[]>(
      `${this.base}/workout-sessions/user/${userId}`,
    );
  }

  getSessionSets(sessionId: number): Observable<WorkoutSetDetail[]> {
    return this.http.get<WorkoutSetDetail[]>(
      `${this.base}/workout-sets/session/${sessionId}`,
    );
  }

  markRestDay(userId: number, sessionDate: string): Observable<WorkoutSessionSummary> {
    return this.http.post<WorkoutSessionSummary>(
      `${this.base}/workout-sessions`,
      { userId, sessionDate, restDay: true },
    );
  }

  updateSession(sessionId: number, payload: UpdateWorkoutSessionRequest): Observable<WorkoutSessionSummary> {
    return this.http.put<WorkoutSessionSummary>(
      `${this.base}/workout-sessions/${sessionId}`,
      payload,
    );
  }

  deleteSession(sessionId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/workout-sessions/${sessionId}`);
  }

  updateWorkoutSet(
    sessionId: number,
    exerciseId: number,
    setId: number,
    payload: UpdateWorkoutSetRequest,
  ): Observable<WorkoutSetDetail> {
    return this.http.put<WorkoutSetDetail>(
      `${this.base}/workout-sets/session/${sessionId}/exercise/${exerciseId}/set/${setId}`,
      payload,
    );
  }

  createWorkoutSet(
    sessionId: number,
    exerciseId: number,
    payload: UpdateWorkoutSetRequest,
  ): Observable<WorkoutSetDetail> {
    return this.http.post<WorkoutSetDetail>(
      `${this.base}/workout-sets/session/${sessionId}/exercise/${exerciseId}`,
      payload,
    );
  }

  deleteWorkoutSet(setId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/workout-sets/${setId}`);
  }

  getWorkoutPlans(): Observable<WorkoutPlanResponse[]> {
    return this.http.get<WorkoutPlanResponse[]>(`${this.base}/workout-plans`);
  }

  getPlanExercises(): Observable<PlanExerciseResponse[]> {
    return this.http.get<PlanExerciseResponse[]>(`${this.base}/plan-exercises`);
  }

  getExercises(): Observable<ExerciseCatalogItem[]> {
    return this.http.get<ExerciseCatalogItem[]>(`${this.base}/exercises`);
  }

  // Full save: creates a session, then for every exercise finds-or-creates
  // the exercise in the DB and posts each individual set.
  saveWorkout(
    userId: number,
    sessionDate: string,   // 'YYYY-MM-DD'
    notes: string,
    exercises: ExerciseToSave[],
  ): Observable<void> {
    // Step 1: create the session
    return this.http
      .post<SessionResponse>(`${this.base}/workout-sessions`, { userId, sessionDate, notes })
      .pipe(
        concatMap(session =>
          exercises.length === 0
            ? of(undefined)
            : this.saveExercises(session.id, exercises),
        ),
        map(() => undefined as void),
        defaultIfEmpty(undefined as void),
      );
  }

  // Saves each exercise sequentially, then all sets for it in parallel
  private saveExercises(sessionId: number, exercises: ExerciseToSave[]): Observable<unknown> {
    // concatMap processes exercises one at a time (in order)
    return exercises.reduce<Observable<unknown>>(
      (chain, exercise) =>
        chain.pipe(concatMap(() => this.saveOneExercise(sessionId, exercise))),
      of(undefined),
    );
  }

  private saveOneExercise(sessionId: number, exercise: ExerciseToSave): Observable<unknown> {
    // Step 2a: find or create the exercise record
    return this.http
      .post<FindOrCreateExerciseResponse>(`${this.base}/exercises/find-or-create`, {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
      })
      .pipe(
        concatMap(ex => {
          // Step 2b: post each set in parallel
          const setRequests = Array.from({ length: exercise.sets }, (_, i) =>
            this.http.post(
              `${this.base}/workout-sets/session/${sessionId}/exercise/${ex.id}`,
              {
                setNumber: i + 1,
                reps: exercise.reps,
                weight: exercise.weight,
                durationSeconds: exercise.durationMinutes * 60,
                rpe: exercise.rpe,
                completed: exercise.completed,
              },
            ),
          );
          return setRequests.length > 0 ? forkJoin(setRequests) : of([]);
        }),
      );
  }
}
