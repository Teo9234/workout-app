import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, concatMap, defaultIfEmpty, forkJoin, map, of } from 'rxjs';

interface SessionResponse {
  id: number;
}

interface ExerciseResponse {
  id: number;
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
      .post<ExerciseResponse>(`${this.base}/exercises/find-or-create`, {
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
