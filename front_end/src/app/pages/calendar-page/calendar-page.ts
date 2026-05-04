import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type CalendarDay = {
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
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
            [routerLink]="['/app/day', day.isoDate]"
          >
            <span class="day-number">{{ day.dayNumber }}</span>
            <span class="day-label">Open day</span>
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

    .day-number {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .day-label {
      font-size: 0.85rem;
      color: #52606d;
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
        isoDate,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === anchorDate.getMonth(),
        isToday: isoDate === today,
      };
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}