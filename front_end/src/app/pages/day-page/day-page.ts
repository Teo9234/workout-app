import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  EQUIPMENT_OPTIONS,
  MUSCLE_GROUPS,
  type Equipment,
  type MuscleGroup,
} from '../../shared/exercise-taxonomy';

type ExerciseOption = {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
};

type WorkoutPlan = {
  name: string;
  description: string;
  planType: string;
  difficulty: string;
  exercises: ExerciseOption[];
};

type LoggedExercise = {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  sets: number;
  reps: number;
  weight: number;
  durationMinutes: number;
  rpe: number;
  completed: boolean;
};

@Component({
  selector: 'app-day-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="day-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Workout Day</p>
          <h2>{{ formattedDate }}</h2>
          <p class="subtitle">Review and update what you did on this date.</p>
        </div>

        <a routerLink="/app/calendar" class="back-link">Back to calendar</a>
      </header>

      <section class="page-grid">
        <article class="card plan-card">
          <h3>Workout plan</h3>

          <label>
            <span>Plan</span>
            <select [(ngModel)]="selectedPlanName" name="selectedPlanName" (ngModelChange)="onPlanChange()">
              @for (plan of workoutPlans; track plan.name) {
                <option [value]="plan.name">{{ plan.name }}</option>
              }
            </select>
          </label>

          <div class="plan-meta">
            <p><strong>Type:</strong> {{ selectedPlan.planType }}</p>
            <p><strong>Difficulty:</strong> {{ selectedPlan.difficulty }}</p>
            <p><strong>Description:</strong> {{ selectedPlan.description }}</p>
            <p><strong>Planned exercises:</strong> {{ selectedPlan.exercises.length }}</p>
          </div>
        </article>

        <article class="card add-card">
          <div class="add-card-header">
            <h3>Add exercise</h3>
            @if (selectedPlan.planType !== 'CUSTOM') {
              <button
                type="button"
                class="odd-choice-btn"
                [class.odd-choice-btn--active]="isOddChoice"
                (click)="toggleOddChoice()"
              >
                {{ isOddChoice ? 'Back to plan' : 'Odd choice' }}
              </button>
            }
          </div>
          @if (isOddChoice) {
            <p class="odd-note">Adding off-plan exercise</p>
          }

          <label>
            <span>Muscle group</span>
            <select
              [(ngModel)]="selectedMuscleGroup"
              name="selectedMuscleGroup"
              (ngModelChange)="onMuscleGroupChange()"
            >
              @for (muscleGroup of availableMuscleGroups; track muscleGroup) {
                <option [value]="muscleGroup">{{ muscleGroup }}</option>
              }
            </select>
          </label>

          <label>
            <span>Equipment</span>
            <select
              [(ngModel)]="selectedEquipment"
              name="selectedEquipment"
              (ngModelChange)="onEquipmentChange()"
            >
              @for (equipment of availableEquipmentOptions; track equipment) {
                <option [value]="equipment">{{ equipment }}</option>
              }
            </select>
          </label>

          <label>
            <span>Exercise</span>
            <select [(ngModel)]="selectedExerciseName" name="selectedExerciseName">
              @for (exercise of filteredExercises; track exercise.name) {
                <option [value]="exercise.name">{{ exercise.name }}</option>
              }
            </select>
          </label>

          <div class="exercise-meta">
            <p><strong>Muscle group:</strong> {{ selectedExercise.muscleGroup }}</p>
            <p><strong>Equipment:</strong> {{ selectedExercise.equipment }}</p>
          </div>

          <button type="button" (click)="addExercise()">Add to this day</button>
        </article>

        <article class="card notes-card">
          <h3>Notes</h3>

          <textarea
            [(ngModel)]="notes"
            name="notes"
            rows="6"
            placeholder="How did the workout feel?"
          ></textarea>
        </article>
      </section>

      <section class="entries-section">
        <div class="entries-header">
          <h3>Logged exercises</h3>
          <p>{{ loggedExercises.length }} item(s)</p>
        </div>

        @if (loggedExercises.length === 0) {
          <article class="empty-state">
            <p>No exercises logged yet for this day.</p>
          </article>
        } @else {
          <div class="entries-list">
            @for (entry of loggedExercises; track entry.id) {
              <article class="entry-card">
                <div class="entry-top">
                  <div>
                    <h4>{{ entry.name }}</h4>
                    <p class="entry-meta">{{ entry.muscleGroup }} · {{ entry.equipment }}</p>
                  </div>
                  <button type="button" class="delete-button" (click)="removeExercise(entry.id)">
                    Delete
                  </button>
                </div>

                <div class="field-grid">
                  <label>
                    <span>Sets</span>
                    <input type="number" min="1" [(ngModel)]="entry.sets" [name]="'sets-' + entry.id" />
                  </label>

                  <label>
                    <span>Reps</span>
                    <input type="number" min="0" [(ngModel)]="entry.reps" [name]="'reps-' + entry.id" />
                  </label>

                  <label>
                    <span>Weight</span>
                    <input
                      type="number"
                      min="0"
                      [(ngModel)]="entry.weight"
                      [name]="'weight-' + entry.id"
                    />
                  </label>

                  <label>
                    <span>Duration (min)</span>
                    <input
                      type="number"
                      min="0"
                      [(ngModel)]="entry.durationMinutes"
                      [name]="'duration-' + entry.id"
                    />
                  </label>

                  <label>
                    <span>RPE</span>
                    <input type="number" min="0" max="10" [(ngModel)]="entry.rpe" [name]="'rpe-' + entry.id" />
                  </label>

                  <label class="checkbox-field">
                    <input type="checkbox" [(ngModel)]="entry.completed" [name]="'completed-' + entry.id" />
                    <span>Completed</span>
                  </label>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </section>
  `,
  styles: `
    .day-page {
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

    h2,
    h3,
    h4 {
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

    .page-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .card,
    .entry-card,
    .empty-state {
      padding: 20px;
      border-radius: 24px;
      background: linear-gradient(180deg, #ffffff 0%, #edf4f7 100%);
      box-shadow: 0 12px 30px rgba(34, 51, 59, 0.08);
    }

    .add-card,
    .plan-card,
    .notes-card,
    .entries-section {
      display: grid;
      gap: 16px;
    }

    textarea,
    select,
    input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #c9d6df;
      border-radius: 12px;
      font: inherit;
      box-sizing: border-box;
    }

    label {
      display: grid;
      gap: 8px;
      color: #22333b;
    }

    .exercise-meta,
    .entry-meta,
    .plan-meta {
      margin: 0;
      color: #52606d;
    }

    .exercise-meta,
    .plan-meta {
      display: grid;
      gap: 4px;
    }

    .exercise-meta p,
    .plan-meta p {
      margin: 0;
    }

    button {
      width: fit-content;
      padding: 10px 16px;
      border: 0;
      border-radius: 999px;
      background: #22333b;
      color: #fff;
      font: inherit;
      cursor: pointer;
    }

    .entries-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .entries-header p {
      margin: 0;
      color: #52606d;
    }

    .add-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .odd-choice-btn {
      background: transparent;
      border: 1.5px solid #22333b;
      color: #22333b;
      padding: 6px 14px;
      font-size: 0.85rem;
    }

    .odd-choice-btn--active {
      background: #22333b;
      color: #fff;
    }

    .odd-note {
      margin: 0;
      font-size: 0.8rem;
      color: #7a4f00;
      background: #fff8e6;
      border: 1px solid #f0c060;
      border-radius: 8px;
      padding: 6px 12px;
    }

    .entries-list {
      display: grid;
      gap: 16px;
    }

    .entry-card {
      display: grid;
      gap: 16px;
    }

    .entry-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .delete-button {
      background: #9d2b25;
    }

    .field-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 30px;
    }

    .checkbox-field input {
      width: auto;
      margin: 0;
    }

    @media (max-width: 820px) {
      .page-grid,
      .field-grid {
        grid-template-columns: 1fr;
      }

      .day-page {
        padding: 16px;
      }
    }
  `,
})
export class DayPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected workoutPlans: WorkoutPlan[] = [
    {
      name: 'Push Day Starter',
      description: 'A simple upper-body pushing plan for steady progress.',
      planType: 'PUSH',
      difficulty: 'BEGINNER',
      exercises: [
        // Chest exercises
        { name: 'Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Incline Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Decline Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Dumbbell Bench Press', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Incline Dumbbell Press', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Decline Dumbbell Press', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Chest Press Machine', muscleGroup: 'CHEST', equipment: 'CHEST_PRESS_MACHINE' },
        { name: 'Incline Chest Press Machine', muscleGroup: 'CHEST', equipment: 'CHEST_PRESS_MACHINE' },
        { name: 'Smith Machine Bench Press', muscleGroup: 'CHEST', equipment: 'SMITH_MACHINE' },
        { name: 'Smith Machine Incline Press', muscleGroup: 'CHEST', equipment: 'SMITH_MACHINE' },
        { name: 'Cable Chest Press', muscleGroup: 'CHEST', equipment: 'CABLE_CROSSOVER' },
        { name: 'Standing Cable Chest Press', muscleGroup: 'CHEST', equipment: 'CABLE_CROSSOVER' },
        { name: 'Low Cable Chest Press', muscleGroup: 'CHEST', equipment: 'CABLE_CROSSOVER' },
        { name: 'Cable Fly', muscleGroup: 'CHEST', equipment: 'CABLE_CROSSOVER' },
        { name: 'Low to High Cable Fly', muscleGroup: 'CHEST', equipment: 'CABLE_CROSSOVER' },
        { name: 'High to Low Cable Fly', muscleGroup: 'CHEST', equipment: 'CABLE_CROSSOVER' },
        { name: 'Dumbbell Chest Fly', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Incline Dumbbell Fly', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Decline Dumbbell Fly', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Pec Deck Fly', muscleGroup: 'CHEST', equipment: 'PEC_DECK' },
        { name: 'Push-Up', muscleGroup: 'CHEST', equipment: 'BODYWEIGHT' },
        { name: 'Decline Push-Up', muscleGroup: 'CHEST', equipment: 'BODYWEIGHT' },
        { name: 'Incline Push-Up', muscleGroup: 'CHEST', equipment: 'BODYWEIGHT' },

        // Shoulder exercises
        { name: 'Overhead Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'BARBELL' },
        { name: 'Seated Barbell Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'BARBELL' },
        { name: 'Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Arnold Press', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Smith Machine Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'SMITH_MACHINE' },
        { name: 'Shoulder Press Machine', muscleGroup: 'SHOULDERS', equipment: 'SHOULDER_PRESS_MACHINE' },
        { name: 'Cable Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Dumbbell Lateral Raise', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Cable Lateral Raise', muscleGroup: 'SHOULDERS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Machine Lateral Raise', muscleGroup: 'SHOULDERS', equipment: 'LATERAL_RAISE_MACHINE' },
        { name: 'Front Raise (Dumbbell)', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Front Raise (Barbell)', muscleGroup: 'SHOULDERS', equipment: 'BARBELL' },
        { name: 'Cable Front Raise', muscleGroup: 'SHOULDERS', equipment: 'CABLE_CROSSOVER' },

        // Triceps exercises
        { name: 'Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Rope Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Straight Bar Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Overhead Cable Tricep Extension', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Dumbbell Overhead Tricep Extension', muscleGroup: 'TRICEPS', equipment: 'DUMBBELL' },
        { name: 'Seated Dumbbell Tricep Extension', muscleGroup: 'TRICEPS', equipment: 'DUMBBELL' },
        { name: 'EZ Bar Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'BARBELL' },
        { name: 'Barbell Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'BARBELL' },
        { name: 'Cable Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Close-Grip Bench Press', muscleGroup: 'TRICEPS', equipment: 'BARBELL' },
        { name: 'Close-Grip Smith Machine Press', muscleGroup: 'TRICEPS', equipment: 'SMITH_MACHINE' },
        { name: 'Bench Dips', muscleGroup: 'TRICEPS', equipment: 'BODYWEIGHT' },
        { name: 'Assisted Dips', muscleGroup: 'TRICEPS', equipment: 'ASSISTED_PULL_UP_MACHINE' },
        { name: 'Parallel Bar Dips', muscleGroup: 'TRICEPS', equipment: 'BODYWEIGHT' },
        { name: 'Tricep Extension Machine', muscleGroup: 'TRICEPS', equipment: 'TRICEP_EXTENSION_MACHINE' }

      ],
    },
    {
      name: 'Pull and Posterior',
      description: 'Back and hamstring focus with pulling movements.',
      planType: 'PULL',
      difficulty: 'INTERMEDIATE',
      exercises: [
        // Back exercises
        { name: 'Pull-Up', muscleGroup: 'BACK', equipment: 'BODYWEIGHT' },
        { name: 'Chin-Up', muscleGroup: 'BACK', equipment: 'BODYWEIGHT' },
        { name: 'Assisted Pull-Up', muscleGroup: 'BACK', equipment: 'ASSISTED_PULL_UP_MACHINE' },
        { name: 'Lat Pulldown', muscleGroup: 'BACK', equipment: 'LAT_PULLDOWN' },
        { name: 'Wide Grip Lat Pulldown', muscleGroup: 'BACK', equipment: 'LAT_PULLDOWN' },
        { name: 'Close Grip Lat Pulldown', muscleGroup: 'BACK', equipment: 'LAT_PULLDOWN' },
        { name: 'Reverse Grip Lat Pulldown', muscleGroup: 'BACK', equipment: 'LAT_PULLDOWN' },
        { name: 'Seated Cable Row', muscleGroup: 'BACK', equipment: 'CABLE_CROSSOVER' },
        { name: 'Single Arm Cable Row', muscleGroup: 'BACK', equipment: 'CABLE_CROSSOVER' },
        { name: 'Bent Over Barbell Row', muscleGroup: 'BACK', equipment: 'BARBELL' },
        { name: 'Pendlay Row', muscleGroup: 'BACK', equipment: 'BARBELL' },
        { name: 'T-Bar Row', muscleGroup: 'BACK', equipment: 'T_BAR_ROW_MACHINE' },
        { name: 'Dumbbell Row', muscleGroup: 'BACK', equipment: 'DUMBBELL' },
        { name: 'Chest Supported Dumbbell Row', muscleGroup: 'BACK', equipment: 'DUMBBELL' },
        { name: 'Machine Row', muscleGroup: 'BACK', equipment: 'SEATED_ROW_MACHINE' },
        { name: 'Cable Pullover', muscleGroup: 'BACK', equipment: 'CABLE_CROSSOVER' },
        { name: 'Straight Arm Pulldown', muscleGroup: 'BACK', equipment: 'CABLE_CROSSOVER' },
        { name: 'Inverted Row', muscleGroup: 'BACK', equipment: 'BODYWEIGHT' },
        
        // Hamstring and glute exercises
        { name: 'Barbell Curl', muscleGroup: 'BICEPS', equipment: 'BARBELL' },
        { name: 'EZ Bar Curl', muscleGroup: 'BICEPS', equipment: 'BARBELL' },
        { name: 'Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Alternating Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Hammer Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Incline Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Preacher Curl Machine', muscleGroup: 'BICEPS', equipment: 'PREACHER_CURL_MACHINE' },
        { name: 'Cable Curl', muscleGroup: 'BICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Rope Cable Curl', muscleGroup: 'BICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Concentration Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },

        // Forearm exercises
        { name: 'Wrist Curl (Barbell)', muscleGroup: 'FOREARMS', equipment: 'BARBELL' },
        { name: 'Reverse Wrist Curl (Barbell)', muscleGroup: 'FOREARMS', equipment: 'BARBELL' },
        { name: 'Wrist Curl (Dumbbell)', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Reverse Wrist Curl (Dumbbell)', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Cable Wrist Curl', muscleGroup: 'FOREARMS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Reverse Cable Curl', muscleGroup: 'FOREARMS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Farmer’s Walk', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Plate Pinch Hold', muscleGroup: 'FOREARMS', equipment: 'WEIGHT_PLATES' },

        // Posterior chain exercises
        { name: 'Deadlift', muscleGroup: 'BACK', equipment: 'BARBELL' },
        { name: 'Romanian Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Stiff Leg Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Sumo Deadlift', muscleGroup: 'GLUTES', equipment: 'BARBELL' },
        { name: 'Dumbbell Romanian Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'DUMBBELL' },
        { name: 'Good Morning', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Back Extension', muscleGroup: 'BACK', equipment: 'ROMAN_CHAIR_HYPEREXTENSION_BENCH' },
        { name: 'Reverse Hyperextension', muscleGroup: 'GLUTES', equipment: 'ROMAN_CHAIR_HYPEREXTENSION_BENCH' },
        { name: 'Glute Bridge', muscleGroup: 'GLUTES', equipment: 'BODYWEIGHT' },
        { name: 'Barbell Hip Thrust', muscleGroup: 'GLUTES', equipment: 'BARBELL' },
        { name: 'Dumbbell Hip Thrust', muscleGroup: 'GLUTES', equipment: 'DUMBBELL' },
        { name: 'Cable Pull Through', muscleGroup: 'GLUTES', equipment: 'CABLE_CROSSOVER' },
        { name: 'Leg Curl (Seated)', muscleGroup: 'HAMSTRINGS', equipment: 'LEG_CURL_LYING' },
        { name: 'Leg Curl (Lying)', muscleGroup: 'HAMSTRINGS', equipment: 'LEG_CURL_LYING' },

        // Additional shoulder exercises for balance
        { name: 'Face Pull', muscleGroup: 'SHOULDERS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Rear Delt Fly (Dumbbell)', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Rear Delt Fly (Machine)', muscleGroup: 'SHOULDERS', equipment: 'REAR_DELT_MACHINE' },
        { name: 'Reverse Pec Deck', muscleGroup: 'SHOULDERS', equipment: 'PEC_DECK' }
      ],
    },
    {
      name: 'Arms Accessory',
      description: 'Extra arm work with direct biceps and triceps isolation.',
      planType: 'UPPER_BODY',
      difficulty: 'BEGINNER',
      exercises: [
        // Biceps exercises
        { name: 'Barbell Curl', muscleGroup: 'BICEPS', equipment: 'BARBELL' },
        { name: 'EZ Bar Curl', muscleGroup: 'BICEPS', equipment: 'BARBELL' },
        { name: 'Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Alternating Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Hammer Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Incline Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Concentration Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Preacher Curl Machine', muscleGroup: 'BICEPS', equipment: 'PREACHER_CURL_MACHINE' },
        { name: 'Cable Curl', muscleGroup: 'BICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Rope Cable Curl', muscleGroup: 'BICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Reverse Grip Cable Curl', muscleGroup: 'BICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Spider Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },

        // Triceps exercises
        { name: 'Close-Grip Bench Press', muscleGroup: 'TRICEPS', equipment: 'BARBELL' },
        { name: 'EZ Bar Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'BARBELL' },
        { name: 'Barbell Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'BARBELL' },
        { name: 'Dumbbell Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'DUMBBELL' },
        { name: 'Overhead Dumbbell Tricep Extension', muscleGroup: 'TRICEPS', equipment: 'DUMBBELL' },
        { name: 'Seated Dumbbell Tricep Extension', muscleGroup: 'TRICEPS', equipment: 'DUMBBELL' },
        { name: 'Cable Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Rope Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Straight Bar Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Overhead Cable Tricep Extension', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Cable Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Tricep Extension Machine', muscleGroup: 'TRICEPS', equipment: 'TRICEP_EXTENSION_MACHINE' },
        { name: 'Bench Dips', muscleGroup: 'TRICEPS', equipment: 'BODYWEIGHT' },
        { name: 'Assisted Dips', muscleGroup: 'TRICEPS', equipment: 'ASSISTED_PULL_UP_MACHINE' },
        { name: 'Parallel Bar Dips', muscleGroup: 'TRICEPS', equipment: 'BODYWEIGHT' },

        //  Forearm exercises
        { name: 'Wrist Curl (Barbell)', muscleGroup: 'FOREARMS', equipment: 'BARBELL' },
        { name: 'Reverse Wrist Curl (Barbell)', muscleGroup: 'FOREARMS', equipment: 'BARBELL' },
        { name: 'Behind-the-Back Wrist Curl (Barbell)', muscleGroup: 'FOREARMS', equipment: 'BARBELL' },
        { name: 'Wrist Curl (Dumbbell)', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Reverse Wrist Curl (Dumbbell)', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Hammer Curl Hold', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Cable Wrist Curl', muscleGroup: 'FOREARMS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Reverse Cable Curl', muscleGroup: 'FOREARMS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Farmer’s Walk', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Plate Pinch Hold', muscleGroup: 'FOREARMS', equipment: 'WEIGHT_PLATES' }
      ],
    },
    {
      name: 'Cardio Builder',
      description: 'A cardio-heavy session for endurance work.',
      planType: 'CARDIO',
      difficulty: 'BEGINNER',
      exercises: [
        // Treadmill exercises
        { name: 'Treadmill Run', muscleGroup: 'CARDIO', equipment: 'TREADMILL' },
        { name: 'Treadmill Walk', muscleGroup: 'CARDIO', equipment: 'TREADMILL' },
        { name: 'Incline Treadmill Walk', muscleGroup: 'CARDIO', equipment: 'TREADMILL' },
        { name: 'Sprint Intervals (Treadmill)', muscleGroup: 'CARDIO', equipment: 'TREADMILL' },

        // Bike exercises
        { name: 'Stationary Bike Ride', muscleGroup: 'CARDIO', equipment: 'EXERCISE_BIKE_UPRIGHT' },
        { name: 'Recumbent Bike Ride', muscleGroup: 'CARDIO', equipment: 'RECUMBENT_BIKE' },
        { name: 'Spin Bike Session', muscleGroup: 'CARDIO', equipment: 'SPIN_BIKE' },
        { name: 'HIIT Bike Intervals', muscleGroup: 'CARDIO', equipment: 'SPIN_BIKE' },
        { name: 'Air Bike Sprint', muscleGroup: 'CARDIO', equipment: 'AIR_BIKE' },

        // Elliptical exercises
        { name: 'Elliptical Trainer', muscleGroup: 'CARDIO', equipment: 'ELLIPTICAL' },
        { name: 'Elliptical Intervals', muscleGroup: 'CARDIO', equipment: 'ELLIPTICAL' },

        // Rowing machine exercises
        { name: 'Rowing Machine', muscleGroup: 'CARDIO', equipment: 'ROWING_MACHINE' },
        { name: 'Rowing Intervals', muscleGroup: 'CARDIO', equipment: 'ROWING_MACHINE' },

        // Stair climber exercises
        { name: 'Stair Climber', muscleGroup: 'CARDIO', equipment: 'STAIR_CLIMBER' },
        { name: 'Stepmill Intervals', muscleGroup: 'CARDIO', equipment: 'STAIR_CLIMBER' },

        // Ski Erg exercises
        { name: 'Ski Erg', muscleGroup: 'CARDIO', equipment: 'SKI_ERG' },
        { name: 'Ski Erg Intervals', muscleGroup: 'CARDIO', equipment: 'SKI_ERG' },

        // VersaClimber exercises
        { name: 'VersaClimber', muscleGroup: 'CARDIO', equipment: 'VERSACLIMBER' },
        { name: 'VersaClimber Intervals', muscleGroup: 'CARDIO', equipment: 'VERSACLIMBER' },

        // Assault Bike exercises
        { name: 'Assault Bike', muscleGroup: 'CARDIO', equipment: 'AIR_BIKE' },

        // Jacobs Ladder exercises
        { name: 'Jacobs Ladder', muscleGroup: 'CARDIO', equipment: 'JACOBS_LADDER' },

        // Arm Ergometer exercises
        { name: 'Arm Ergometer', muscleGroup: 'CARDIO', equipment: 'ARM_ERGOMETER' },

        // Bodyweight cardio exercises
        { name: 'Jump Rope', muscleGroup: 'CARDIO', equipment: 'BODYWEIGHT' },
        { name: 'Burpees', muscleGroup: 'CARDIO', equipment: 'BODYWEIGHT' },
        { name: 'Mountain Climbers', muscleGroup: 'CARDIO', equipment: 'BODYWEIGHT' },
        { name: 'High Knees', muscleGroup: 'CARDIO', equipment: 'BODYWEIGHT' }
      ],
    },

    {
      name: 'Leg Day Base',
      description: 'Lower-body strength foundation session.',
      planType: 'LEGS',
      difficulty: 'INTERMEDIATE',
      exercises: [

        // Quadriceps exercises
        { name: 'Barbell Back Squat', muscleGroup: 'QUADRICEPS', equipment: 'BARBELL' },
        { name: 'Front Squat', muscleGroup: 'QUADRICEPS', equipment: 'BARBELL' },
        { name: 'Hack Squat', muscleGroup: 'QUADRICEPS', equipment: 'HACK_SQUAT_MACHINE' },
        { name: 'Leg Press', muscleGroup: 'QUADRICEPS', equipment: 'LEG_PRESS' },
        { name: 'Smith Machine Squat', muscleGroup: 'QUADRICEPS', equipment: 'SMITH_MACHINE' },
        { name: 'Dumbbell Goblet Squat', muscleGroup: 'QUADRICEPS', equipment: 'DUMBBELL' },
        { name: 'Walking Lunges', muscleGroup: 'QUADRICEPS', equipment: 'DUMBBELL' },
        { name: 'Bulgarian Split Squat', muscleGroup: 'QUADRICEPS', equipment: 'DUMBBELL' },
        { name: 'Leg Extension', muscleGroup: 'QUADRICEPS', equipment: 'LEG_EXTENSION' },

        // Hamstring and glute exercises
        { name: 'Romanian Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Stiff Leg Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Sumo Deadlift', muscleGroup: 'GLUTES', equipment: 'BARBELL' },
        { name: 'Dumbbell Romanian Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'DUMBBELL' },
        { name: 'Good Morning', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Seated Leg Curl', muscleGroup: 'HAMSTRINGS', equipment: 'LEG_CURL_LYING' },
        { name: 'Lying Leg Curl', muscleGroup: 'HAMSTRINGS', equipment: 'LEG_CURL_LYING' },

        // Glute exercises
        { name: 'Barbell Hip Thrust', muscleGroup: 'GLUTES', equipment: 'BARBELL' },
        { name: 'Dumbbell Hip Thrust', muscleGroup: 'GLUTES', equipment: 'DUMBBELL' },
        { name: 'Glute Bridge', muscleGroup: 'GLUTES', equipment: 'BODYWEIGHT' },
        { name: 'Cable Pull Through', muscleGroup: 'GLUTES', equipment: 'CABLE_CROSSOVER' },
        { name: 'Glute Kickback Machine', muscleGroup: 'GLUTES', equipment: 'GLUTE_KICKBACK_MACHINE' },
        { name: 'Reverse Hyperextension', muscleGroup: 'GLUTES', equipment: 'ROMAN_CHAIR_HYPEREXTENSION_BENCH' },

        // Calf exercises
        { name: 'Standing Calf Raise', muscleGroup: 'CALVES', equipment: 'CALF_RAISE_MACHINE' },
        { name: 'Seated Calf Raise', muscleGroup: 'CALVES', equipment: 'CALF_RAISE_MACHINE' },
        { name: 'Smith Machine Calf Raise', muscleGroup: 'CALVES', equipment: 'SMITH_MACHINE' },
        { name: 'Dumbbell Calf Raise', muscleGroup: 'CALVES', equipment: 'DUMBBELL' },
        { name: 'Leg Press Calf Raise', muscleGroup: 'CALVES', equipment: 'LEG_PRESS' },

        // Additional leg exercises
        { name: 'Walking Lunge', muscleGroup: 'LEGS', equipment: 'DUMBBELL' },
        { name: 'Step-Ups', muscleGroup: 'LEGS', equipment: 'DUMBBELL' },
        { name: 'Bodyweight Squat', muscleGroup: 'QUADRICEPS', equipment: 'BODYWEIGHT' },
        { name: 'Jump Squat', muscleGroup: 'QUADRICEPS', equipment: 'BODYWEIGHT' },
        { name: 'Box Jump', muscleGroup: 'QUADRICEPS', equipment: 'PLYOMETRIC_BOXES' },
        { name: 'Sled Push', muscleGroup: 'QUADRICEPS', equipment: 'SLED' },
        { name: 'Sled Pull', muscleGroup: 'HAMSTRINGS', equipment: 'SLED' },

        // Core exercises
        { name: 'Hanging Leg Raise', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' },
        { name: 'Lying Leg Raise', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' },
        { name: 'Cable Crunch', muscleGroup: 'ABS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Ab Crunch Machine', muscleGroup: 'ABS', equipment: 'AB_CRUNCH_MACHINE' },
        { name: 'Plank', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' },
        { name: 'Russian Twist', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' }
      ],
    },
    {
      name: 'All-Round',
      description: 'Free choice — filter by any muscle group and equipment to build your own session.',
      planType: 'CUSTOM',
      difficulty: 'INTERMEDIATE',
      exercises: [
        { name: 'Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Incline Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Decline Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Dumbbell Bench Press', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Incline Dumbbell Press', muscleGroup: 'CHEST', equipment: 'DUMBBELL' },
        { name: 'Cable Chest Press', muscleGroup: 'CHEST', equipment: 'CABLE_CROSSOVER' },
        { name: 'Pec Deck Fly', muscleGroup: 'CHEST', equipment: 'PEC_DECK' },

        { name: 'Pull-Up', muscleGroup: 'BACK', equipment: 'BODYWEIGHT' },
        { name: 'Lat Pulldown', muscleGroup: 'BACK', equipment: 'LAT_PULLDOWN' },
        { name: 'Seated Cable Row', muscleGroup: 'BACK', equipment: 'CABLE_CROSSOVER' },
        { name: 'Barbell Row', muscleGroup: 'BACK', equipment: 'BARBELL' },
        { name: 'Dumbbell Row', muscleGroup: 'BACK', equipment: 'DUMBBELL' },
        { name: 'Straight Arm Pulldown', muscleGroup: 'BACK', equipment: 'CABLE_CROSSOVER' },

        { name: 'Overhead Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'BARBELL' },
        { name: 'Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Lateral Raise', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Cable Lateral Raise', muscleGroup: 'SHOULDERS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Face Pull', muscleGroup: 'SHOULDERS', equipment: 'CABLE_CROSSOVER' },

        { name: 'Barbell Curl', muscleGroup: 'BICEPS', equipment: 'BARBELL' },
        { name: 'Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Hammer Curl', muscleGroup: 'BICEPS', equipment: 'DUMBBELL' },
        { name: 'Cable Curl', muscleGroup: 'BICEPS', equipment: 'CABLE_CROSSOVER' },

        { name: 'Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Overhead Tricep Extension', muscleGroup: 'TRICEPS', equipment: 'DUMBBELL' },
        { name: 'Skullcrusher', muscleGroup: 'TRICEPS', equipment: 'BARBELL' },
        { name: 'Bench Dips', muscleGroup: 'TRICEPS', equipment: 'BODYWEIGHT' },

        { name: 'Wrist Curl', muscleGroup: 'FOREARMS', equipment: 'BARBELL' },
        { name: 'Reverse Wrist Curl', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },
        { name: 'Farmer’s Walk', muscleGroup: 'FOREARMS', equipment: 'DUMBBELL' },

        { name: 'Back Squat', muscleGroup: 'QUADRICEPS', equipment: 'BARBELL' },
        { name: 'Leg Press', muscleGroup: 'QUADRICEPS', equipment: 'LEG_PRESS' },
        { name: 'Leg Extension', muscleGroup: 'QUADRICEPS', equipment: 'LEG_EXTENSION' },
        { name: 'Bulgarian Split Squat', muscleGroup: 'QUADRICEPS', equipment: 'DUMBBELL' },

        { name: 'Romanian Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Lying Leg Curl', muscleGroup: 'HAMSTRINGS', equipment: 'LEG_CURL_LYING' },
        { name: 'Good Morning', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },

        { name: 'Hip Thrust', muscleGroup: 'GLUTES', equipment: 'BARBELL' },
        { name: 'Cable Pull Through', muscleGroup: 'GLUTES', equipment: 'CABLE_CROSSOVER' },
        { name: 'Glute Bridge', muscleGroup: 'GLUTES', equipment: 'BODYWEIGHT' },

        { name: 'Standing Calf Raise', muscleGroup: 'CALVES', equipment: 'CALF_RAISE_MACHINE' },
        { name: 'Seated Calf Raise', muscleGroup: 'CALVES', equipment: 'CALF_RAISE_MACHINE' },

        { name: 'Hanging Leg Raise', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' },
        { name: 'Cable Crunch', muscleGroup: 'ABS', equipment: 'CABLE_CROSSOVER' },
        { name: 'Plank', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' },

        { name: 'Treadmill Run', muscleGroup: 'CARDIO', equipment: 'TREADMILL' },
        { name: 'Rowing Machine', muscleGroup: 'CARDIO', equipment: 'ROWING_MACHINE' },
        { name: 'Spin Bike Intervals', muscleGroup: 'CARDIO', equipment: 'SPIN_BIKE' },
        { name: 'Jump Rope', muscleGroup: 'CARDIO', equipment: 'BODYWEIGHT' }
      ],
    },
    {
      name: 'Lower Body Strength',
      description: 'Focused lower-body session for quads, hamstrings, glutes and calves.',
      planType: 'LOWER_BODY',
      difficulty: 'INTERMEDIATE',
      exercises: [
        { name: 'Back Squat', muscleGroup: 'QUADRICEPS', equipment: 'BARBELL' },
        { name: 'Leg Press', muscleGroup: 'QUADRICEPS', equipment: 'LEG_PRESS' },
        { name: 'Romanian Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Lying Leg Curl', muscleGroup: 'HAMSTRINGS', equipment: 'LEG_CURL_LYING' },
        { name: 'Hip Thrust', muscleGroup: 'GLUTES', equipment: 'BARBELL' },
        { name: 'Standing Calf Raise', muscleGroup: 'CALVES', equipment: 'CALF_RAISE_MACHINE' },
      ],
    },
    {
      name: 'Full Body Prime',
      description: 'Balanced full-body training with one movement per major area.',
      planType: 'FULL_BODY',
      difficulty: 'INTERMEDIATE',
      exercises: [
        { name: 'Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL' },
        { name: 'Lat Pulldown', muscleGroup: 'BACK', equipment: 'LAT_PULLDOWN' },
        { name: 'Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL' },
        { name: 'Back Squat', muscleGroup: 'QUADRICEPS', equipment: 'BARBELL' },
        { name: 'Romanian Deadlift', muscleGroup: 'HAMSTRINGS', equipment: 'BARBELL' },
        { name: 'Plank', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' },
      ],
    },
    {
      name: 'Stretch and Mobility',
      description: 'Recovery-focused stretching and mobility routine.',
      planType: 'STRETCHING',
      difficulty: 'BEGINNER',
      exercises: [
        { name: 'Foam Roll Upper Back', muscleGroup: 'BACK', equipment: 'FOAM_ROLLER' },
        { name: 'Hip Mobility Flow', muscleGroup: 'GLUTES', equipment: 'BODYWEIGHT' },
        { name: 'Hamstring Stretch', muscleGroup: 'HAMSTRINGS', equipment: 'BODYWEIGHT' },
        { name: 'Calf Stretch', muscleGroup: 'CALVES', equipment: 'BODYWEIGHT' },
        { name: 'Shoulder Mobility Drill', muscleGroup: 'SHOULDERS', equipment: 'STRETCH_BANDS' },
      ],
    },
    {
      name: 'Bodyweight Circuit',
      description: 'No-equipment workout using bodyweight only.',
      planType: 'BODYWEIGHT',
      difficulty: 'BEGINNER',
      exercises: [
        { name: 'Push-Up', muscleGroup: 'CHEST', equipment: 'BODYWEIGHT' },
        { name: 'Pull-Up', muscleGroup: 'BACK', equipment: 'BODYWEIGHT' },
        { name: 'Bodyweight Squat', muscleGroup: 'QUADRICEPS', equipment: 'BODYWEIGHT' },
        { name: 'Walking Lunge', muscleGroup: 'LEGS', equipment: 'BODYWEIGHT' },
        { name: 'Glute Bridge', muscleGroup: 'GLUTES', equipment: 'BODYWEIGHT' },
        { name: 'Plank', muscleGroup: 'ABS', equipment: 'BODYWEIGHT' },
      ],
    },
  ];

  protected selectedPlanName = this.workoutPlans[0].name;
  protected selectedMuscleGroup: MuscleGroup = this.workoutPlans[0].exercises[0].muscleGroup;
  protected selectedEquipment: Equipment = this.workoutPlans[0].exercises[0].equipment;
  protected selectedExerciseName = this.workoutPlans[0].exercises[0].name;
  protected formattedDate = '';
  protected notes = '';
  protected loggedExercises: LoggedExercise[] = [];

  protected get selectedPlan(): WorkoutPlan {
    return this.workoutPlans.find((plan) => plan.name === this.selectedPlanName) ?? this.workoutPlans[0];
  }

  protected isOddChoice = false;

  protected get isFreeMode(): boolean {
    return this.isOddChoice || this.selectedPlan.planType === 'CUSTOM';
  }

  private get exerciseSource(): ExerciseOption[] {
    if (!this.isFreeMode) return this.selectedPlan.exercises;
    return (
      this.workoutPlans.find((p) => p.planType === 'CUSTOM')?.exercises ?? this.selectedPlan.exercises
    );
  }

  protected get availableExercises(): ExerciseOption[] {
    return this.selectedPlan.exercises;
  }

  protected get availableMuscleGroups(): MuscleGroup[] {
    if (this.isFreeMode) return [...MUSCLE_GROUPS];
    return MUSCLE_GROUPS.filter((muscleGroup) =>
      this.availableExercises.some((exercise) => exercise.muscleGroup === muscleGroup),
    );
  }

  protected get availableEquipmentOptions(): Equipment[] {
    return EQUIPMENT_OPTIONS.filter((equipment) =>
      this.exerciseSource.some(
        (exercise) =>
          exercise.muscleGroup === this.selectedMuscleGroup && exercise.equipment === equipment,
      ),
    );
  }

  protected get filteredExercises(): ExerciseOption[] {
    const exactMatches = this.exerciseSource.filter(
      (exercise) =>
        exercise.muscleGroup === this.selectedMuscleGroup &&
        exercise.equipment === this.selectedEquipment,
    );

    if (exactMatches.length > 0 || !this.isFreeMode) return exactMatches;

    return this.exerciseSource.filter(
      (exercise) => exercise.muscleGroup === this.selectedMuscleGroup,
    );
  }

  protected get selectedExercise(): ExerciseOption {
    return (
      this.filteredExercises.find((exercise) => exercise.name === this.selectedExerciseName) ??
      this.filteredExercises[0] ??
      this.exerciseSource[0]
    );
  }

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const routeDate = params.get('date') ?? this.toIsoDate(new Date());
      this.formattedDate = this.formatDate(routeDate);
      this.loggedExercises = this.buildSampleEntries(routeDate);
      this.notes = `Notes for ${routeDate} will live here.`;
    });
  }

  protected addExercise(): void {
    const selectedExercise = this.selectedExercise;

    this.loggedExercises = [
      ...this.loggedExercises,
      {
        id: Date.now(),
        name: selectedExercise.name,
        muscleGroup: selectedExercise.muscleGroup,
        equipment: selectedExercise.equipment,
        sets: 3,
        reps: 10,
        weight: 0,
        durationMinutes: 0,
        rpe: 7,
        completed: false,
      },
    ];
  }

  protected onPlanChange(): void {
    this.isOddChoice = false;
    const firstExercise = this.selectedPlan.exercises[0];

    this.selectedMuscleGroup = firstExercise?.muscleGroup ?? MUSCLE_GROUPS[0];
    this.selectedEquipment = firstExercise?.equipment ?? EQUIPMENT_OPTIONS[0];
    this.selectedExerciseName = firstExercise?.name ?? '';
  }

  protected toggleOddChoice(): void {
    this.isOddChoice = !this.isOddChoice;
    if (!this.availableMuscleGroups.includes(this.selectedMuscleGroup)) {
      this.selectedMuscleGroup = this.availableMuscleGroups[0] ?? MUSCLE_GROUPS[0];
    }
    this.onMuscleGroupChange();
  }

  protected onMuscleGroupChange(): void {
    if (!this.availableEquipmentOptions.includes(this.selectedEquipment)) {
      this.selectedEquipment = this.availableEquipmentOptions[0] ?? EQUIPMENT_OPTIONS[0];
    }

    this.onEquipmentChange();
  }

  protected onEquipmentChange(): void {
    if (!this.filteredExercises.some((exercise) => exercise.name === this.selectedExerciseName)) {
      this.selectedExerciseName = this.filteredExercises[0]?.name ?? '';
    }
  }

  protected removeExercise(entryId: number): void {
    this.loggedExercises = this.loggedExercises.filter((entry) => entry.id !== entryId);
  }

  private buildSampleEntries(routeDate: string): LoggedExercise[] {
    const dayNumber = Number(routeDate.slice(-2)) || 1;

    return [
      {
        id: dayNumber * 10 + 1,
        name: 'Bench Press',
        muscleGroup: 'CHEST',
        equipment: 'BARBELL',
        sets: 4,
        reps: 8,
        weight: 60,
        durationMinutes: 0,
        rpe: 8,
        completed: true,
      },
      {
        id: dayNumber * 10 + 2,
        name: 'Running',
        muscleGroup: 'CARDIO',
        equipment: 'TREADMILL',
        sets: 1,
        reps: 0,
        weight: 0,
        durationMinutes: 25,
        rpe: 6,
        completed: dayNumber % 2 === 0,
      },
    ];
  }

  private formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const safeDate = new Date(year, (month ?? 1) - 1, day ?? 1);

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(safeDate);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}


