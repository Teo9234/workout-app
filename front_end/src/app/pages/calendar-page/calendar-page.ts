import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { UserService } from '../../shared/user.service';
import { WorkoutApiService } from '../../shared/workout-api.service';

type CalendarDay = {
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasWorkout: boolean;
  badges: string[];
};

@Component({
  selector: 'app-calendar-page',
  imports: [RouterLink],
  template: `
    <section class="calendar-page">
      <header class="calendar-header">
        <div>
          <p class="eyebrow">Workout Calendar</p>
          <h2>{{ monthLabel }}</h2>
          <p class="subtitle">Choose a day to open that workout page.</p>
        </div>

        <div class="calendar-actions">
          <button type="button" (click)="showPreviousMonth()">Previous</button>
          <button type="button" (click)="jumpToToday()">Today</button>
          <button type="button" (click)="showNextMonth()">Next</button>
        </div>
      </header>

      <div class="weekday-row">
        @for (label of weekDayLabels; track label) {
          <p>{{ label }}</p>
        }
      </div>

      <div class="calendar-grid">
        @for (day of calendarDays; track day.isoDate) {
          <a
            class="day-cell"
            [class.day-cell--outside]="!day.isCurrentMonth"
            [class.day-cell--today]="day.isToday"
            [class.day-cell--has-workout]="day.hasWorkout"
            [routerLink]="['/app/day', day.isoDate]"
          >
            <span class="day-number">{{ day.dayNumber }}</span>
            @if (day.hasWorkout) {
              <span class="day-icons">
                @for (badge of day.badges; track $index) {
                  <span class="day-icon" [class.day-icon--odd]="badge === 'ODD'">{{ badge }}</span>
                }
              </span>
            }
            <span class="day-label">{{ day.hasWorkout ? 'Workout logged' : 'Open day' }}</span>
          </a>
        }
      </div>
    </section>
  `,
  styles: `
    .calendar-page {
      display: grid;
      gap: 24px;
      padding: 24px;
    }

    .calendar-header {
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

    .subtitle {
      margin: 8px 0 0;
      color: #52606d;
    }

    .calendar-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    button {
      padding: 10px 16px;
      border: 1px solid #c9d6df;
      border-radius: 999px;
      background: #fff;
      color: #22333b;
      font: inherit;
      cursor: pointer;
    }

    .weekday-row,
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 12px;
    }

    .weekday-row p {
      margin: 0;
      text-align: center;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #667781;
    }

    .day-cell {
      min-height: 112px;
      padding: 14px;
      border-radius: 20px;
      background: linear-gradient(180deg, #ffffff 0%, #edf4f7 100%);
      box-shadow: 0 12px 30px rgba(34, 51, 59, 0.08);
      color: #22333b;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .day-cell--outside {
      opacity: 0.45;
    }

    .day-cell--today {
      outline: 2px solid #1c6e8c;
      outline-offset: 2px;
    }

    .day-cell--has-workout {
      background: linear-gradient(180deg, #e7f4ea 0%, #d6ebde 100%);
      border: 1px solid #9ac5aa;
    }

    .day-number {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .day-label {
      font-size: 0.85rem;
      color: #52606d;
    }

    .day-icons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin: 6px 0;
      max-width: 100%;
      overflow: hidden;
    }

    .day-icon {
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      border-radius: 999px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      background: #1c6e8c;
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .day-icon--odd {
      background: #9d2b25;
    }

    @media (max-width: 720px) {
      .calendar-page {
        padding: 16px;
      }

      .weekday-row,
      .calendar-grid {
        gap: 8px;
      }

      .day-cell {
        min-height: 88px;
        padding: 10px;
      }

      .day-number {
        font-size: 1.15rem;
      }
    }
  `,
})
export class CalendarPageComponent {
  protected readonly weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  protected currentMonth = new Date();
  protected monthLabel = '';
  protected calendarDays: CalendarDay[] = [];
  protected loadingSessions = false;

  private readonly workoutApi = inject(WorkoutApiService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);
  private workoutDates = new Set<string>();
  private workoutBadgesByDate = new Map<string, string[]>();

  constructor() {
    this.refreshCalendar();
  }

  protected showPreviousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1,
    );
    this.refreshCalendar();
  }

  protected showNextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1,
    );
    this.refreshCalendar();
  }

  protected jumpToToday(): void {
    this.currentMonth = new Date();
    this.refreshCalendar();
  }

  private refreshCalendar(): void {
    this.monthLabel = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(this.currentMonth);

    this.calendarDays = this.buildCalendarDays(this.currentMonth);
    this.loadMonthSessions();
  }

  private loadMonthSessions(): void {
    const user = this.userService.getMe();
    if (!user) {
      this.workoutDates = new Set<string>();
      this.workoutBadgesByDate = new Map<string, string[]>();
      this.calendarDays = this.buildCalendarDays(this.currentMonth);
      this.cdr.detectChanges();
      return;
    }

    const monthStart = this.toIsoDate(new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      1,
    ));
    const monthEnd = this.toIsoDate(new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      0,
    ));

    this.loadingSessions = true;
    forkJoin({
      sessions: this.workoutApi.getSessionsBetween(user.id, monthStart, monthEnd),
      plans: this.workoutApi.getWorkoutPlans().pipe(catchError(() => of([]))),
    }).pipe(
      finalize(() => {
        this.loadingSessions = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: ({ sessions, plans }) => {
        const planBadgeById = new Map<number, string>(
          plans.map((plan) => [plan.id, this.toPlanTypeBadge(plan.planType)]),
        );

        this.workoutDates = new Set(sessions.map((session) => session.sessionDate));
        this.workoutBadgesByDate = new Map<string, string[]>();
        for (const session of sessions) {
          const badgesForDate = this.workoutBadgesByDate.get(session.sessionDate) ?? [];

          const notes = session.notes ?? '';
          const sessionPlanBadges: string[] = [];

          if (session.workoutPlanId) {
            const mappedPlanBadge = planBadgeById.get(session.workoutPlanId) ?? '';
            if (mappedPlanBadge) {
              sessionPlanBadges.push(mappedPlanBadge);
            }
          }

          const taggedPlanTypes = this.extractPlanTypeTags(notes);
          for (const taggedPlanType of taggedPlanTypes) {
            const taggedBadge = this.toPlanTypeBadge(taggedPlanType);
            if (taggedBadge) {
              sessionPlanBadges.push(taggedBadge);
            }
          }

          for (const sessionPlanBadge of sessionPlanBadges) {
            badgesForDate.push(sessionPlanBadge);
          }

          if (this.hasOddTag(notes)) {
            badgesForDate.push('ODD');
          }

          this.workoutBadgesByDate.set(session.sessionDate, badgesForDate);
        }

        this.calendarDays = this.buildCalendarDays(this.currentMonth);
        this.cdr.detectChanges();
      },
      error: () => {
        this.workoutDates = new Set<string>();
        this.workoutBadgesByDate = new Map<string, string[]>();
        this.calendarDays = this.buildCalendarDays(this.currentMonth);
        this.cdr.detectChanges();
      },
    });
  }

  private buildCalendarDays(anchorDate: Date): CalendarDay[] {
    const firstDayOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const lastDayOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
    const startOffset = firstDayOfMonth.getDay();
    const totalCells = Math.ceil((startOffset + lastDayOfMonth.getDate()) / 7) * 7;
    const gridStartDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1 - startOffset);
    const today = this.toIsoDate(new Date());

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(gridStartDate);
      date.setDate(gridStartDate.getDate() + index);

      const isoDate = this.toIsoDate(date);

      return {
        badges: this.normalizeBadgesForCell(this.workoutBadgesByDate.get(isoDate) ?? ['WO']),
        isoDate,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === anchorDate.getMonth(),
        isToday: isoDate === today,
        hasWorkout: this.workoutDates.has(isoDate),
      };
    });
  }

  private normalizeBadgesForCell(badges: string[]): string[] {
    const cleaned = badges.filter((badge) => badge.length > 0);
    if (cleaned.length === 0) {
      return ['WO'];
    }

    const workoutBadges = Array.from(new Set(cleaned.filter((badge) => badge !== 'ODD'))).slice(0, 2);
    const hasOdd = cleaned.includes('ODD');
    const normalized = hasOdd ? [...workoutBadges, 'ODD'] : workoutBadges;

    return normalized.length > 0 ? normalized.slice(0, 3) : ['WO'];
  }

  private toPlanTypeBadge(planType: string): string {
    const normalized = planType.trim().toUpperCase();

    const knownBadges: Record<string, string> = {
      PUSH: 'PD',
      PULL: 'PL',
      LEGS: 'LD',
      CARDIO: 'CD',
      UPPER_BODY: 'UB',
      LOWER_BODY: 'LB',
      FULL_BODY: 'FB',
      STRETCHING: 'ST',
      BODYWEIGHT: 'BW',
      CUSTOM: 'CU',
    };

    const mapped = knownBadges[normalized];
    if (mapped) {
      return mapped;
    }

    const segments = normalized.split('_').filter((segment) => segment.length > 0);
    if (segments.length === 0) {
      return '';
    }

    if (segments.length === 1) {
      return segments[0].slice(0, 2).padEnd(2, 'X');
    }

    return `${segments[0][0]}${segments[1][0]}`;
  }

  private extractPlanTypeTags(notes: string): string[] {
    const matches = notes.matchAll(/\[plan-type:([A-Z_]+)\]/gi);
    return Array.from(matches, (match) => (match[1] ?? '').toUpperCase()).filter((tag) => tag.length > 0);
  }

  private hasOddTag(notes: string): boolean {
    return /\[odd-choice\]/i.test(notes);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}