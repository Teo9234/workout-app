import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UserService } from '../../shared/user.service';
import {
  type ExerciseCatalogItem,
  type UpdateWorkoutSessionRequest,
  type UpdateWorkoutSetRequest,
  type WorkoutSessionSummary,
  type WorkoutSetDetail,
  WorkoutApiService,
} from '../../shared/workout-api.service';

type EditableWorkoutSet = WorkoutSetDetail & {
  saving?: boolean;
  deleting?: boolean;
};

type SessionEntry = WorkoutSessionSummary & {
  sets: EditableWorkoutSet[];
  expanded: boolean;
  loadingSets: boolean;
  editingSession: boolean;
  editingSets: boolean;
  savingSession: boolean;
  deletingSession: boolean;
  draftNotes: string;
  draftRestDay: boolean;
  actionError: string;
  addingSetExerciseIds: number[];
  draftNewExerciseId: number | null;
  addingExercise: boolean;
};

@Component({
  selector: 'app-progress-page',
  imports: [RouterLink, DecimalPipe, FormsModule],
  template: `
    <section class="progress-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Your Journey</p>
          <h2>Progress</h2>
          <p class="subtitle">All your logged workouts at a glance.</p>
        </div>
        <a routerLink="/app/calendar" class="back-link">Back to calendar</a>
      </header>

      @if (loading) {
        <p class="state-msg">Loading your history…</p>
      } @else if (loadError) {
        <p class="state-msg state-msg--error">Could not load history. Is the server running?</p>
      } @else {
        <!-- Stats strip -->
        <div class="stat-strip">
          <div class="stat-card">
            <span class="stat-value">{{ totalSessions }}</span>
            <span class="stat-label">Total sessions</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ restDays }}</span>
            <span class="stat-label">Rest days</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ thisMonthSessions }}</span>
            <span class="stat-label">This month</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ totalSets }}</span>
            <span class="stat-label">Total sets</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ totalVolumeKg | number:'1.0-0' }} kg</span>
            <span class="stat-label">Total volume</span>
          </div>
        </div>

        <article class="consistency-card">
          <div class="consistency-head">
            <h3>Consistency</h3>
            <div class="consistency-head__right">
              <p>Track momentum week by week.</p>
              <div class="week-nav">
                <button type="button" class="week-nav__btn" (click)="goToPreviousWeek()" aria-label="Previous week">←</button>
                <span class="week-nav__label">{{ visibleWeekLabel }}</span>
                <button type="button" class="week-nav__btn" (click)="goToNextWeek()" [disabled]="!canGoToNextWeek" aria-label="Next week">→</button>
              </div>
            </div>
          </div>

          <div class="consistency-metrics">
            <div>
              <p class="metric-label">Current streak</p>
              <p class="metric-value">{{ currentWorkoutStreak }} day(s)</p>
            </div>
            <div>
              <p class="metric-label">Best streak</p>
              <p class="metric-value">{{ bestWorkoutStreak }} day(s)</p>
            </div>
            <div>
              <p class="metric-label">Week logged</p>
              <p class="metric-value">{{ visibleWeekLoggedDays }}/7</p>
            </div>
          </div>

          <div class="week-strip">
            @for (day of weekDayCells; track day.dateKey) {
              <div class="week-cell" [class.week-cell--workout]="day.workout" [class.week-cell--rest]="day.rest" [class.week-cell--today]="day.today">
                <span class="week-cell__name">{{ day.label }}</span>
                <span class="week-cell__mark">{{ day.workout ? 'W' : (day.rest ? 'R' : '•') }}</span>
              </div>
            }
          </div>

          <div class="week-legend">
            <span><i class="week-legend__dot week-legend__dot--workout"></i> Workout</span>
            <span><i class="week-legend__dot week-legend__dot--rest"></i> Rest</span>
            <span><i class="week-legend__dot week-legend__dot--empty"></i> Empty</span>
          </div>
        </article>

        <!-- Session history -->
        @if (sessions.length === 0) {
          <article class="empty-state">
            <p>No sessions logged yet. Head to the calendar to start tracking!</p>
          </article>
        } @else {
          <div class="session-list">
            @for (session of sessions; track session.id) {
              <article class="session-card" [class.session-card--rest]="session.restDay">
                <div class="session-top" (click)="toggleSession(session)">
                  <div class="session-meta">
                    <span class="session-date">{{ formatDate(session.sessionDate) }}</span>
                    @if (session.draftRestDay) {
                      <span class="badge badge--rest">Rest Day</span>
                    } @else {
                      <span class="badge badge--workout">Workout</span>
                    }
                  </div>
                  <div class="session-summary">
                    @if (session.editingSession) {
                      <label class="inline-field" (click)="$event.stopPropagation()">
                        <span>Notes</span>
                        <textarea rows="2" [(ngModel)]="session.draftNotes" [name]="'notes-' + session.id" (keydown.escape)="cancelSessionEdit(session)"></textarea>
                      </label>
                      <label class="inline-check" (click)="$event.stopPropagation()">
                        <input type="checkbox" [(ngModel)]="session.draftRestDay" [name]="'rest-' + session.id" />
                        <span>Rest day</span>
                      </label>
                    } @else {
                      @if (getSessionPlanSummary(session)) {
                        <p class="session-notes session-notes--meta">{{ getSessionPlanSummary(session) }}</p>
                      }
                      @if (getVisibleSessionNotes(session)) {
                        <p class="session-notes">{{ getVisibleSessionNotes(session) }}</p>
                      }
                    }
                    @if (!session.draftRestDay) {
                      <p class="session-set-count">
                        {{ getExerciseCount(session) }} exercise(s) ·
                        {{ session.sets.length }} sets
                      </p>
                    }
                  </div>
                  <div class="session-actions" (click)="$event.stopPropagation()">
                    @if (session.editingSession) {
                      <button type="button" class="action-btn" [disabled]="session.savingSession" (click)="saveSessionChanges(session)">Save</button>
                      <button type="button" class="action-btn" [disabled]="session.savingSession" (click)="cancelSessionEdit(session)">Cancel</button>
                    } @else {
                      <button type="button" class="action-btn" [disabled]="session.deletingSession" (click)="startSessionEdit(session)">Edit</button>
                    }
                    <button type="button" class="danger-btn" [disabled]="session.deletingSession || session.savingSession" (click)="deleteSession(session)">
                      {{ session.deletingSession ? 'Deleting…' : 'Delete' }}
                    </button>
                  </div>
                  <button type="button" class="expand-btn" [attr.aria-label]="session.expanded ? 'Collapse' : 'Expand'">
                    {{ session.expanded ? '▲' : '▼' }}
                  </button>
                </div>
                @if (session.actionError) {
                  <p class="state-msg state-msg--error session-error">{{ session.actionError }}</p>
                }

                @if (session.expanded) {
                  <div class="session-detail">
                    @if (session.loadingSets) {
                      <p class="state-msg">Loading sets…</p>
                    } @else if (session.draftRestDay) {
                      <p class="rest-note">You took a well-deserved rest on this day.</p>
                    } @else {
                      <div class="set-toolbar">
                        <button type="button" class="action-btn" (click)="toggleSetEditing(session)">
                          {{ session.editingSets ? 'Done editing sets' : 'Edit sets' }}
                        </button>
                        @if (session.editingSets) {
                          <div class="add-exercise-controls">
                            <select
                              class="exercise-select"
                              [(ngModel)]="session.draftNewExerciseId"
                              [name]="'new-exercise-' + session.id"
                            >
                              <option [ngValue]="null">Select exercise…</option>
                              @for (exercise of availableExercisesForSession(session); track exercise.id) {
                                <option [ngValue]="exercise.id">{{ exercise.name }}</option>
                              }
                            </select>
                            <button
                              type="button"
                              class="action-btn"
                              [disabled]="session.addingExercise || session.draftNewExerciseId == null"
                              (click)="addExerciseToSession(session)"
                            >
                              {{ session.addingExercise ? 'Adding…' : 'Add exercise' }}
                            </button>
                          </div>
                        }
                      </div>
                      @if (session.sets.length === 0) {
                        <p class="rest-note">No sets recorded for this session. Use Edit Sets to add an exercise.</p>
                      } @else {
                        @for (group of groupByExercise(session.sets); track group.exerciseName) {
                          <div class="exercise-group">
                            <div class="exercise-header-row">
                              <h4>{{ group.exerciseName }}</h4>
                              @if (session.editingSets) {
                                <button
                                  type="button"
                                  class="action-btn action-btn--small"
                                  [disabled]="isAddingSet(session, group.exerciseId)"
                                  (click)="addSetForExercise(session, group.exerciseId)"
                                >
                                  {{ isAddingSet(session, group.exerciseId) ? 'Adding…' : 'Add set' }}
                                </button>
                              }
                            </div>
                            <div class="set-row set-row--header" [class.set-row--editing]="session.editingSets">
                              <span>Set</span><span>Reps</span><span>Weight</span><span>RPE</span><span>Done</span>
                              @if (session.editingSets) {
                                <span>Actions</span>
                              }
                            </div>
                            @for (set of group.sets; track set.id) {
                              <div class="set-row" [class.set-row--editing]="session.editingSets">
                                <span>{{ set.setNumber }}</span>
                                <span>
                                  @if (session.editingSets) {
                                    <input class="set-input" type="number" min="0" [(ngModel)]="set.reps" [name]="'reps-' + set.id" (keydown.enter)="onSetInputEnter($event, session, set)" />
                                  } @else {
                                    {{ set.reps ?? '—' }}
                                  }
                                </span>
                                <span>
                                  @if (session.editingSets) {
                                    <input class="set-input" type="number" min="0" step="0.5" [(ngModel)]="set.weight" [name]="'weight-' + set.id" (keydown.enter)="onSetInputEnter($event, session, set)" />
                                  } @else {
                                    {{ set.weight != null ? (set.weight + ' kg') : '—' }}
                                  }
                                </span>
                                <span>
                                  @if (session.editingSets) {
                                    <input class="set-input" type="number" min="0" max="10" step="0.5" [(ngModel)]="set.rpe" [name]="'rpe-' + set.id" (keydown.enter)="onSetInputEnter($event, session, set)" />
                                  } @else {
                                    {{ set.rpe ?? '—' }}
                                  }
                                </span>
                                <span>
                                  @if (session.editingSets) {
                                    <input type="checkbox" [(ngModel)]="set.completed" [name]="'done-' + set.id" />
                                  } @else {
                                    {{ set.completed ? '✓' : '✗' }}
                                  }
                                </span>
                                @if (session.editingSets) {
                                  <span class="set-actions">
                                    <button type="button" class="action-btn action-btn--small" [disabled]="set.saving || set.deleting" (click)="saveSet(session, set)">
                                      {{ set.saving ? 'Saving…' : 'Save' }}
                                    </button>
                                    <button type="button" class="danger-btn action-btn--small" [disabled]="set.saving || set.deleting" (click)="deleteSet(session, set)">
                                      {{ set.deleting ? 'Deleting…' : 'Delete' }}
                                    </button>
                                  </span>
                                }
                              </div>
                            }
                          </div>
                        }
                      }
                    }
                  </div>
                }
              </article>
            }
          </div>
        }
      }

      @if (toastMessage) {
        <div class="toast" [class.toast--error]="toastType === 'error'">
          <span>{{ toastMessage }}</span>
          @if (toastActionLabel) {
            <button type="button" class="toast-action" (click)="onToastAction()">{{ toastActionLabel }}</button>
          }
          <button type="button" class="toast-close" aria-label="Dismiss notification" (click)="dismissToast()">✕</button>
        </div>
      }
    </section>
  `,
  styles: `
    .progress-page {
      display: grid;
      gap: 24px;
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: end;
      flex-wrap: wrap;
    }

    .eyebrow {
      margin: 0 0 8px;
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #5c6b73;
    }

    h2 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3rem);
      color: #22333b;
    }

    h4 {
      margin: 0 0 8px;
      color: #22333b;
    }

    h3 {
      margin: 0;
      color: #22333b;
    }

    .subtitle {
      margin: 8px 0 0;
      color: #52606d;
    }

    .back-link {
      color: #1c6e8c;
      text-decoration: none;
      font-weight: 600;
    }

    /* Stat strip */
    .stat-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 20px 12px;
      border-radius: 20px;
      background: linear-gradient(180deg, #ffffff 0%, #edf4f7 100%);
      box-shadow: 0 12px 30px rgba(34, 51, 59, 0.08);
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #22333b;
    }

    .stat-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #52606d;
    }

    .consistency-card {
      display: grid;
      gap: 14px;
      padding: 18px;
      border-radius: 20px;
      background: linear-gradient(140deg, #fcffef 0%, #f1f7ff 100%);
      box-shadow: 0 12px 30px rgba(34, 51, 59, 0.08);
    }

    .consistency-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }

    .consistency-head p {
      margin: 0;
      color: #52606d;
      font-size: 0.9rem;
    }

    .consistency-head__right {
      display: grid;
      justify-items: end;
      gap: 8px;
    }

    .week-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .week-nav__btn {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      border: 1px solid #c9d6df;
      background: #fff;
      color: #22333b;
      font: inherit;
      cursor: pointer;
      line-height: 1;
    }

    .week-nav__btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .week-nav__label {
      font-size: 0.8rem;
      color: #22333b;
      font-weight: 600;
      min-width: 170px;
      text-align: center;
    }

    .consistency-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
    }

    .consistency-metrics > div {
      padding: 10px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid #deebf4;
    }

    .metric-label {
      margin: 0;
      color: #52606d;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .metric-value {
      margin: 4px 0 0;
      color: #22333b;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .week-strip {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 8px;
    }

    .week-cell {
      display: grid;
      justify-items: center;
      gap: 4px;
      padding: 8px 4px;
      border-radius: 12px;
      border: 1px solid #d7e4ec;
      background: #fff;
    }

    .week-cell--workout {
      background: #d4edda;
      border-color: #c3e6cb;
    }

    .week-cell--rest {
      background: #efe2ff;
      border-color: #dec6ff;
    }

    .week-cell--today {
      box-shadow: inset 0 0 0 2px #1c6e8c;
    }

    .week-cell__name {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #52606d;
    }

    .week-cell__mark {
      font-size: 0.95rem;
      font-weight: 700;
      color: #22333b;
    }

    .week-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      font-size: 0.8rem;
      color: #52606d;
    }

    .week-legend span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .week-legend__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      border: 1px solid #c9d6df;
      background: #fff;
    }

    .week-legend__dot--workout {
      background: #d4edda;
      border-color: #c3e6cb;
    }

    .week-legend__dot--rest {
      background: #efe2ff;
      border-color: #dec6ff;
    }

    .week-legend__dot--empty {
      background: #fff;
      border-color: #d7e4ec;
    }

    /* Session list */
    .session-list {
      display: grid;
      gap: 12px;
    }

    .session-card {
      border-radius: 20px;
      background: linear-gradient(180deg, #ffffff 0%, #edf4f7 100%);
      box-shadow: 0 12px 30px rgba(34, 51, 59, 0.08);
      overflow: hidden;
    }

    .session-card--rest {
      background: linear-gradient(180deg, #f8f3ff 0%, #ede5ff 100%);
    }

    .session-top {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      cursor: pointer;
    }

    .session-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }

    .session-date {
      font-size: 1rem;
      font-weight: 700;
      color: #22333b;
    }

    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .badge--workout {
      background: #d4edda;
      color: #155724;
    }

    .badge--rest {
      background: #e8d5ff;
      color: #5a2d82;
    }

    .session-summary {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .session-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .action-btn,
    .danger-btn {
      border: 1px solid #c9d6df;
      border-radius: 999px;
      background: #fff;
      color: #22333b;
      font: inherit;
      font-size: 0.75rem;
      padding: 4px 10px;
      cursor: pointer;
    }

    .danger-btn {
      border-color: #efb3b3;
      color: #8b1d1d;
      background: #fff5f5;
    }

    .action-btn:disabled,
    .danger-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn--small {
      padding: 3px 8px;
      font-size: 0.7rem;
    }

    .inline-field {
      display: grid;
      gap: 4px;
    }

    .inline-field span {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #52606d;
    }

    .inline-field textarea {
      width: min(420px, 100%);
      border: 1px solid #c9d6df;
      border-radius: 10px;
      font: inherit;
      padding: 6px 8px;
      resize: vertical;
      min-height: 48px;
    }

    .inline-check {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: #52606d;
    }

    .session-notes {
      margin: 0;
      font-size: 0.9rem;
      color: #22333b;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 400px;
    }

    .session-notes--meta {
      color: #1c6e8c;
      font-weight: 600;
    }

    .session-set-count {
      margin: 0;
      font-size: 0.8rem;
      color: #52606d;
    }

    .expand-btn {
      background: transparent;
      border: 1px solid #c9d6df;
      border-radius: 999px;
      color: #22333b;
      padding: 4px 10px;
      font: inherit;
      font-size: 0.75rem;
      cursor: pointer;
      flex-shrink: 0;
    }

    /* Session detail */
    .session-detail {
      padding: 0 20px 16px;
      border-top: 1px solid #dce6ed;
    }

    .session-error {
      margin: 0 20px 10px;
    }

    .set-toolbar {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .add-exercise-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .exercise-select {
      border: 1px solid #c9d6df;
      border-radius: 999px;
      background: #fff;
      font: inherit;
      font-size: 0.75rem;
      padding: 5px 10px;
      min-width: 190px;
    }

    .exercise-group {
      margin-top: 12px;
    }

    .exercise-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .set-row {
      display: grid;
      grid-template-columns: 48px 64px 96px 48px 48px;
      gap: 8px;
      padding: 4px 0;
      font-size: 0.85rem;
      color: #22333b;
      border-bottom: 1px solid #edf4f7;
    }

    .set-row--editing {
      grid-template-columns: 48px 64px 96px 64px 52px minmax(130px, 1fr);
      align-items: center;
    }

    .set-input {
      width: 100%;
      border: 1px solid #c9d6df;
      border-radius: 8px;
      font: inherit;
      padding: 4px 6px;
      min-width: 0;
    }

    .set-actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .set-row--header {
      font-weight: 700;
      color: #52606d;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .rest-note {
      margin: 12px 0 0;
      color: #52606d;
      font-style: italic;
    }

    /* Shared states */
    .empty-state {
      padding: 32px;
      border-radius: 20px;
      background: linear-gradient(180deg, #ffffff 0%, #edf4f7 100%);
      box-shadow: 0 12px 30px rgba(34, 51, 59, 0.08);
      color: #52606d;
      text-align: center;
    }

    .state-msg {
      color: #52606d;
      margin: 0;
    }

    .state-msg--error {
      color: #721c24;
    }

    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 25;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      background: #22333b;
      color: #fff;
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 12px 30px rgba(34, 51, 59, 0.28);
      max-width: min(92vw, 460px);
      line-height: 1.35;
      word-break: break-word;
    }

    .toast--error {
      background: #8b1d1d;
    }

    .toast-action,
    .toast-close {
      border: 0;
      border-radius: 999px;
      font: inherit;
      cursor: pointer;
    }

    .toast-action {
      padding: 4px 10px;
      background: #fff;
      color: #22333b;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .toast-close {
      width: 26px;
      height: 26px;
      line-height: 1;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 0.9rem;
      margin-left: auto;
    }

    @media (max-width: 600px) {
      .progress-page {
        padding: 16px;
      }

      .session-top {
        flex-wrap: wrap;
        gap: 10px;
      }

      .session-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .session-notes {
        max-width: 100%;
      }

      .set-row {
        grid-template-columns: 36px 52px 80px 36px 36px;
        font-size: 0.8rem;
      }

      .set-row--editing {
        grid-template-columns: 30px 52px 72px 52px 44px 1fr;
      }

      .week-strip {
        gap: 6px;
      }

      .consistency-head__right {
        justify-items: start;
      }

      .week-nav__label {
        min-width: 138px;
      }

      .week-cell {
        padding: 8px 2px;
      }

      .week-cell__name {
        font-size: 0.62rem;
      }

      .toast {
        top: auto;
        right: 12px;
        left: 12px;
        bottom: 12px;
        max-width: none;
      }
    }
  `,
})
export class ProgressPageComponent {
  private readonly workoutApi = inject(WorkoutApiService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected sessions: SessionEntry[] = [];
  protected exerciseCatalog: ExerciseCatalogItem[] = [];
  protected loading = true;
  protected loadError = false;
  protected viewedWeekOffset = 0;
  protected toastMessage = '';
  protected toastType: 'success' | 'error' = 'success';
  protected toastActionLabel: string | null = null;

  private toastAction: (() => void) | null = null;
  private toastTimerId: number | null = null;
  private pendingSessionDeletes = new Map<number, { session: SessionEntry; index: number; timerId: number }>();
  private pendingSetDeletes = new Map<number, { sessionId: number; set: EditableWorkoutSet; index: number; timerId: number }>();

  // Computed stats
  protected get totalSessions(): number {
    return this.sessions.filter((s) => !s.restDay).length;
  }

  protected get restDays(): number {
    return this.sessions.filter((s) => s.restDay).length;
  }

  protected get thisMonthSessions(): number {
    const now = new Date();
    return this.sessions.filter((s) => {
      if (s.restDay) return false;
      const d = new Date(s.sessionDate);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }

  protected get totalSets(): number {
    return this.sessions.reduce((acc, s) => acc + s.sets.length, 0);
  }

  protected get totalVolumeKg(): number {
    return this.sessions.reduce(
      (acc, s) =>
        acc +
        s.sets.reduce((setAcc, set) => setAcc + (set.reps ?? 0) * (set.weight ?? 0), 0),
      0,
    );
  }

  protected get currentWorkoutStreak(): number {
    const workouts = this.workoutDateSet;
    if (workouts.size === 0) {
      return 0;
    }

    let streak = 0;
    let cursor = new Date();
    while (workouts.has(this.toDateKey(cursor))) {
      streak += 1;
      cursor = this.addDays(cursor, -1);
    }
    return streak;
  }

  protected get bestWorkoutStreak(): number {
    const sortedWorkoutDates = Array.from(this.workoutDateSet).sort();
    if (sortedWorkoutDates.length === 0) {
      return 0;
    }

    let best = 1;
    let current = 1;

    for (let i = 1; i < sortedWorkoutDates.length; i += 1) {
      const previousDate = this.parseDateKey(sortedWorkoutDates[i - 1]);
      const expectedNext = this.toDateKey(this.addDays(previousDate, 1));
      if (sortedWorkoutDates[i] === expectedNext) {
        current += 1;
      } else {
        current = 1;
      }
      if (current > best) {
        best = current;
      }
    }

    return best;
  }

  protected get visibleWeekLoggedDays(): number {
    const range = this.visibleWeekDateKeys;
    let count = 0;
    for (const dayKey of range) {
      if (this.dateStatusMap.has(dayKey)) {
        count += 1;
      }
    }
    return count;
  }

  protected get visibleWeekLabel(): string {
    const keys = this.visibleWeekDateKeys;
    const first = this.parseDateKey(keys[0]);
    const last = this.parseDateKey(keys[6]);
    return `${this.shortDateLabel(first)} - ${this.shortDateLabel(last)}`;
  }

  protected get canGoToNextWeek(): boolean {
    return this.viewedWeekOffset < 0;
  }

  protected get weekDayCells(): { label: string; dateKey: string; workout: boolean; rest: boolean; today: boolean }[] {
    const statusMap = this.dateStatusMap;
    const todayKey = this.toDateKey(new Date());
    return this.visibleWeekDateKeys.map((dateKey, index) => {
      const status = statusMap.get(dateKey);
      return {
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
        dateKey,
        workout: status === 'workout',
        rest: status === 'rest',
        today: dateKey === todayKey,
      };
    });
  }

  protected goToPreviousWeek(): void {
    this.viewedWeekOffset -= 1;
    this.cdr.detectChanges();
  }

  protected goToNextWeek(): void {
    if (!this.canGoToNextWeek) {
      return;
    }
    this.viewedWeekOffset += 1;
    this.cdr.detectChanges();
  }

  constructor() {
    const user = this.userService.getMe();
    if (!user) {
      this.loading = false;
      this.loadError = true;
      return;
    }

    this.workoutApi.getExercises().subscribe({
      next: (catalog) => {
        this.exerciseCatalog = catalog;
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep the page usable even if the catalog call fails.
        this.exerciseCatalog = [];
        this.cdr.detectChanges();
      },
    });

    this.workoutApi.getAllSessions(user.id).subscribe({
      next: (raw) => {
        // Sort newest first
        this.sessions = raw
          .slice()
          .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
          .map((s) => ({
            ...s,
            sets: [],
            expanded: false,
            loadingSets: false,
            editingSession: false,
            editingSets: false,
            savingSession: false,
            deletingSession: false,
            draftNotes: this.stripMetadataTags(s.notes ?? ''),
            draftRestDay: s.restDay,
            actionError: '',
            addingSetExerciseIds: [],
            draftNewExerciseId: null,
            addingExercise: false,
          }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.cdr.detectChanges();
      },
    });
  }

  protected toggleSession(session: SessionEntry): void {
    session.expanded = !session.expanded;

    // Lazy-load sets the first time it's opened
    if (session.expanded && session.sets.length === 0 && !session.restDay) {
      session.loadingSets = true;
      this.workoutApi.getSessionSets(session.id).subscribe({
        next: (sets) => {
          session.sets = sets.map((set) => ({ ...set, saving: false, deleting: false }));
          session.loadingSets = false;
          this.cdr.detectChanges();
        },
        error: () => {
          session.loadingSets = false;
          this.cdr.detectChanges();
        },
      });
    }

    this.cdr.detectChanges();
  }

  protected startSessionEdit(session: SessionEntry): void {
    session.editingSession = true;
    session.actionError = '';
    session.draftNotes = this.stripMetadataTags(session.notes ?? '');
    session.draftRestDay = session.restDay;
    this.cdr.detectChanges();
  }

  protected cancelSessionEdit(session: SessionEntry): void {
    session.editingSession = false;
    session.actionError = '';
    session.draftNotes = this.stripMetadataTags(session.notes ?? '');
    session.draftRestDay = session.restDay;
    this.cdr.detectChanges();
  }

  protected saveSessionChanges(session: SessionEntry): void {
    const user = this.userService.getMe();
    if (!user) {
      session.actionError = 'User not found. Please log in again.';
      this.cdr.detectChanges();
      return;
    }

    session.savingSession = true;
    session.actionError = '';

    const payload: UpdateWorkoutSessionRequest = {
      userId: user.id,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      notes: this.mergeSessionNotesWithMetadata(session.notes ?? '', session.draftNotes),
      workoutPlanId: session.workoutPlanId,
      restDay: session.draftRestDay,
    };

    this.workoutApi.updateSession(session.id, payload).subscribe({
      next: (updated) => {
        session.notes = updated.notes;
        session.restDay = updated.restDay;
        session.draftNotes = this.stripMetadataTags(updated.notes ?? '');
        session.draftRestDay = updated.restDay;
        session.editingSession = false;
        if (updated.restDay) {
          session.editingSets = false;
        }
        session.savingSession = false;
        this.showToast('Session changes saved.');
        this.cdr.detectChanges();
      },
      error: () => {
        session.savingSession = false;
        session.actionError = 'Failed to save changes.';
        this.cdr.detectChanges();
      },
    });
  }

  protected deleteSession(session: SessionEntry): void {
    const confirmed = confirm(`Delete session on ${this.formatDate(session.sessionDate)}?`);
    if (!confirmed) {
      return;
    }

    if (this.pendingSessionDeletes.has(session.id)) {
      return;
    }

    session.deletingSession = true;
    session.actionError = '';

    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index < 0) {
      return;
    }

    this.sessions.splice(index, 1);

    const timerId = window.setTimeout(() => {
      this.finalizeSessionDelete(session.id);
    }, 5000);

    this.pendingSessionDeletes.set(session.id, { session, index, timerId });
    this.showToast(
      `Session on ${this.formatDate(session.sessionDate)} scheduled for deletion.`,
      'success',
      5000,
      'Undo',
      () => this.undoSessionDelete(session.id),
    );
    this.cdr.detectChanges();
  }

  protected toggleSetEditing(session: SessionEntry): void {
    session.editingSets = !session.editingSets;
    session.actionError = '';
    this.cdr.detectChanges();
  }

  protected isAddingSet(session: SessionEntry, exerciseId: number): boolean {
    return session.addingSetExerciseIds.includes(exerciseId);
  }

  protected addSetForExercise(session: SessionEntry, exerciseId: number): void {
    if (this.isAddingSet(session, exerciseId)) {
      return;
    }

    session.addingSetExerciseIds = [...session.addingSetExerciseIds, exerciseId];
    session.actionError = '';

    const exerciseSets = session.sets.filter((set) => set.exerciseId === exerciseId);
    const maxSetNumber = exerciseSets.reduce((max, set) => Math.max(max, set.setNumber), 0);
    const lastSet = exerciseSets.find((set) => set.setNumber === maxSetNumber) ?? null;

    const payload: UpdateWorkoutSetRequest = {
      setNumber: maxSetNumber + 1,
      reps: this.normalizeNumber(lastSet?.reps),
      weight: this.normalizeNumber(lastSet?.weight),
      durationSeconds: this.normalizeNumber(lastSet?.durationSeconds),
      rpe: this.normalizeNumber(lastSet?.rpe),
      completed: lastSet?.completed ?? true,
    };

    this.workoutApi.createWorkoutSet(session.id, exerciseId, payload).subscribe({
      next: (created) => {
        session.sets = [
          ...session.sets,
          {
            ...created,
            saving: false,
            deleting: false,
          },
        ];
        session.addingSetExerciseIds = session.addingSetExerciseIds.filter((id) => id !== exerciseId);
        this.sortSessionSets(session);
        this.showToast('Set added.');
        this.cdr.detectChanges();
      },
      error: () => {
        session.addingSetExerciseIds = session.addingSetExerciseIds.filter((id) => id !== exerciseId);
        session.actionError = 'Failed to add new set.';
        this.cdr.detectChanges();
      },
    });
  }

  protected availableExercisesForSession(session: SessionEntry): ExerciseCatalogItem[] {
    const usedExerciseIds = new Set(session.sets.map((set) => set.exerciseId));
    return this.exerciseCatalog.filter((exercise) => !usedExerciseIds.has(exercise.id));
  }

  protected addExerciseToSession(session: SessionEntry): void {
    const exerciseId = session.draftNewExerciseId;
    if (exerciseId == null || session.addingExercise) {
      return;
    }

    session.addingExercise = true;
    session.actionError = '';

    const payload: UpdateWorkoutSetRequest = {
      setNumber: 1,
      reps: null,
      weight: null,
      durationSeconds: null,
      rpe: null,
      completed: true,
    };

    this.workoutApi.createWorkoutSet(session.id, exerciseId, payload).subscribe({
      next: (created) => {
        session.sets = [
          ...session.sets,
          {
            ...created,
            saving: false,
            deleting: false,
          },
        ];
        session.draftNewExerciseId = null;
        session.addingExercise = false;
        this.sortSessionSets(session);
        this.showToast('Exercise added to session.');
        this.cdr.detectChanges();
      },
      error: () => {
        session.addingExercise = false;
        session.actionError = 'Failed to add exercise.';
        this.cdr.detectChanges();
      },
    });
  }

  protected saveSet(session: SessionEntry, set: EditableWorkoutSet): void {
    set.saving = true;
    session.actionError = '';

    const payload: UpdateWorkoutSetRequest = {
      setNumber: set.setNumber,
      reps: this.normalizeNumber(set.reps),
      weight: this.normalizeNumber(set.weight),
      durationSeconds: this.normalizeNumber(set.durationSeconds),
      rpe: this.normalizeNumber(set.rpe),
      completed: set.completed,
    };

    this.workoutApi.updateWorkoutSet(session.id, set.exerciseId, set.id, payload).subscribe({
      next: (updated) => {
        set.reps = updated.reps;
        set.weight = updated.weight;
        set.durationSeconds = updated.durationSeconds;
        set.rpe = updated.rpe;
        set.completed = updated.completed;
        set.saving = false;
        this.showToast(`Set #${set.setNumber} saved.`);
        this.cdr.detectChanges();
      },
      error: () => {
        set.saving = false;
        session.actionError = 'Failed to save set changes.';
        this.cdr.detectChanges();
      },
    });
  }

  protected deleteSet(session: SessionEntry, set: EditableWorkoutSet): void {
    const confirmed = confirm(`Delete set #${set.setNumber} for ${set.exerciseName}?`);
    if (!confirmed) {
      return;
    }

    if (this.pendingSetDeletes.has(set.id)) {
      return;
    }

    set.deleting = true;
    session.actionError = '';

    const index = session.sets.findIndex((s) => s.id === set.id);
    if (index < 0) {
      return;
    }

    session.sets.splice(index, 1);

    const timerId = window.setTimeout(() => {
      this.finalizeSetDelete(set.id);
    }, 5000);

    this.pendingSetDeletes.set(set.id, {
      sessionId: session.id,
      set: { ...set },
      index,
      timerId,
    });

    this.showToast(
      `Set #${set.setNumber} removed from ${set.exerciseName}.`,
      'success',
      5000,
      'Undo',
      () => this.undoSetDelete(set.id),
    );
    this.cdr.detectChanges();
  }

  protected onSetInputEnter(event: Event, session: SessionEntry, set: EditableWorkoutSet): void {
    event.preventDefault();
    event.stopPropagation();
    if (!session.editingSets || set.saving || set.deleting) {
      return;
    }
    this.saveSet(session, set);
  }

  protected onToastAction(): void {
    const action = this.toastAction;
    this.dismissToast();
    action?.();
  }

  protected dismissToast(): void {
    if (this.toastTimerId != null) {
      clearTimeout(this.toastTimerId);
      this.toastTimerId = null;
    }
    this.toastMessage = '';
    this.toastActionLabel = null;
    this.toastAction = null;
    this.cdr.detectChanges();
  }

  protected getExerciseCount(session: SessionEntry): number {
    return new Set(session.sets.map((s) => s.exerciseName)).size;
  }

  protected groupByExercise(sets: EditableWorkoutSet[]): { exerciseId: number; exerciseName: string; sets: EditableWorkoutSet[] }[] {
    const map = new Map<string, EditableWorkoutSet[]>();
    for (const set of sets) {
      const existing = map.get(set.exerciseName) ?? [];
      existing.push(set);
      map.set(set.exerciseName, existing);
    }
    return Array.from(map.entries()).map(([exerciseName, groupedSets]) => ({
      exerciseId: groupedSets[0].exerciseId,
      exerciseName,
      sets: groupedSets.slice().sort((a, b) => a.setNumber - b.setNumber),
    }));
  }

  protected formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(isoDate + 'T00:00:00'));
  }

  protected getVisibleSessionNotes(session: SessionEntry): string {
    return this.stripMetadataTags(session.notes ?? '');
  }

  protected getSessionPlanSummary(session: SessionEntry): string {
    const notes = session.notes ?? '';
    const planTypes = Array.from(new Set(this.extractPlanTypeTags(notes)));
    const hasOddChoice = this.hasOddChoiceTag(notes);

    const formattedPlans = planTypes.map((planType) => this.formatPlanType(planType));
    const planSummary = formattedPlans.length > 0
      ? `Plan type: ${formattedPlans.join(', ')}`
      : '';

    if (planSummary && hasOddChoice) {
      return `${planSummary} + Odd choice`;
    }

    if (planSummary) {
      return planSummary;
    }

    return hasOddChoice ? 'Odd choice' : '';
  }

  private get workoutDateSet(): Set<string> {
    return new Set(this.sessions.filter((session) => !session.restDay).map((session) => session.sessionDate));
  }

  private get dateStatusMap(): Map<string, 'workout' | 'rest'> {
    const map = new Map<string, 'workout' | 'rest'>();
    for (const session of this.sessions) {
      const existing = map.get(session.sessionDate);
      if (!session.restDay) {
        map.set(session.sessionDate, 'workout');
        continue;
      }
      if (!existing) {
        map.set(session.sessionDate, 'rest');
      }
    }
    return map;
  }

  private get visibleWeekDateKeys(): string[] {
    const shiftedToday = this.addDays(new Date(), this.viewedWeekOffset * 7);
    const dayOfWeek = shiftedToday.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = this.addDays(shiftedToday, -daysFromMonday);
    monday.setHours(0, 0, 0, 0);

    const keys: string[] = [];
    for (let i = 0; i < 7; i += 1) {
      keys.push(this.toDateKey(this.addDays(monday, i)));
    }
    return keys;
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDateKey(dateKey: string): Date {
    return new Date(`${dateKey}T00:00:00`);
  }

  private shortDateLabel(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

  private mergeSessionNotesWithMetadata(existingRawNotes: string, editedNotes: string): string | null {
    const planTypeTags = Array.from(new Set(this.extractPlanTypeTags(existingRawNotes)));
    const metadataTags = planTypeTags.map((planType) => `[plan-type:${planType}]`);
    if (this.hasOddChoiceTag(existingRawNotes)) {
      metadataTags.push('[odd-choice]');
    }

    const cleanUserNotes = this.stripMetadataTags(editedNotes);
    const metadataSuffix = metadataTags.join(' ');

    if (cleanUserNotes.length > 0 && metadataSuffix.length > 0) {
      return `${cleanUserNotes}\n${metadataSuffix}`;
    }

    if (cleanUserNotes.length > 0) {
      return cleanUserNotes;
    }

    return metadataSuffix.length > 0 ? metadataSuffix : null;
  }

  private extractPlanTypeTags(notes: string): string[] {
    const matches = notes.matchAll(/\[plan-type:([A-Z_]+)\]/gi);
    return Array.from(matches, (match) => (match[1] ?? '').toUpperCase()).filter((tag) => tag.length > 0);
  }

  private hasOddChoiceTag(notes: string): boolean {
    return /\[odd-choice\]/i.test(notes);
  }

  private stripMetadataTags(notes: string): string {
    return notes
      .replace(/\[(plan-type:[A-Z_]+|entry-count:\d+|odd-choice)\]/gi, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private formatPlanType(planType: string): string {
    return planType
      .toLowerCase()
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private normalizeNumber(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private sortSessionSets(session: SessionEntry): void {
    session.sets = session.sets
      .slice()
      .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName) || a.setNumber - b.setNumber);
  }

  private showToast(
    message: string,
    type: 'success' | 'error' = 'success',
    timeoutMs = 2500,
    actionLabel: string | null = null,
    action: (() => void) | null = null,
  ): void {
    if (this.toastTimerId != null) {
      clearTimeout(this.toastTimerId);
    }

    this.toastMessage = message;
    this.toastType = type;
    this.toastActionLabel = actionLabel;
    this.toastAction = action;

    this.toastTimerId = window.setTimeout(() => {
      this.toastMessage = '';
      this.toastActionLabel = null;
      this.toastAction = null;
      this.toastTimerId = null;
      this.cdr.detectChanges();
    }, timeoutMs);
  }

  private undoSessionDelete(sessionId: number): void {
    const pending = this.pendingSessionDeletes.get(sessionId);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timerId);
    pending.session.deletingSession = false;
    this.sessions.splice(Math.min(pending.index, this.sessions.length), 0, pending.session);
    this.pendingSessionDeletes.delete(sessionId);
    this.showToast('Session restored.');
    this.cdr.detectChanges();
  }

  private finalizeSessionDelete(sessionId: number): void {
    const pending = this.pendingSessionDeletes.get(sessionId);
    if (!pending) {
      return;
    }

    this.pendingSessionDeletes.delete(sessionId);
    this.workoutApi.deleteSession(sessionId).subscribe({
      next: () => {
        this.showToast('Session deleted.');
        this.cdr.detectChanges();
      },
      error: () => {
        pending.session.deletingSession = false;
        pending.session.actionError = 'Failed to delete session.';
        this.sessions.splice(Math.min(pending.index, this.sessions.length), 0, pending.session);
        this.showToast('Failed to delete session.', 'error', 3500);
        this.cdr.detectChanges();
      },
    });
  }

  private undoSetDelete(setId: number): void {
    const pending = this.pendingSetDeletes.get(setId);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timerId);
    const session = this.sessions.find((s) => s.id === pending.sessionId);
    if (session) {
      pending.set.deleting = false;
      session.sets.splice(Math.min(pending.index, session.sets.length), 0, pending.set);
      this.sortSessionSets(session);
    }
    this.pendingSetDeletes.delete(setId);
    this.showToast('Set restored.');
    this.cdr.detectChanges();
  }

  private finalizeSetDelete(setId: number): void {
    const pending = this.pendingSetDeletes.get(setId);
    if (!pending) {
      return;
    }

    this.pendingSetDeletes.delete(setId);
    this.workoutApi.deleteWorkoutSet(setId).subscribe({
      next: () => {
        this.showToast('Set deleted.');
        this.cdr.detectChanges();
      },
      error: () => {
        const session = this.sessions.find((s) => s.id === pending.sessionId);
        if (session) {
          pending.set.deleting = false;
          session.sets.splice(Math.min(pending.index, session.sets.length), 0, pending.set);
          session.actionError = 'Failed to delete set.';
          this.sortSessionSets(session);
        }
        this.showToast('Failed to delete set.', 'error', 3500);
        this.cdr.detectChanges();
      },
    });
  }
}
