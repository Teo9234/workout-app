import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink],
  template: `
    <main>
      <header class="shell-header">
        <h1>Workout App</h1>
        <nav class="shell-nav">
          <a routerLink="/app/calendar">Calendar</a>
          <a routerLink="/app/progress">Progress</a>
          <button type="button" (click)="logout()">Logout</button>
        </nav>
      </header>
      <router-outlet />
    </main>
  `,
  styles: `
    .shell-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 18px 24px 0;
    }

    h1 {
      margin: 0;
      color: #22333b;
    }

    .shell-nav {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    a {
      color: #1c6e8c;
      font-weight: 600;
      text-decoration: none;
    }

    button {
      padding: 8px 14px;
      border: 0;
      border-radius: 999px;
      background: #22333b;
      color: #fff;
      font: inherit;
      cursor: pointer;
    }
  `,
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}