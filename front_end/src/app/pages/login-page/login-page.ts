import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-login-page',
    imports: [FormsModule, RouterLink],
    template: `
    <main class="auth-page">
        <section class="auth-card">
        <p class="eyebrow">Workout App</p>
        <h1>Login</h1>
        <p class="subtitle">Sign in with your username and password.</p>

        <form #loginForm="ngForm" (ngSubmit)="onSubmit()" class="auth-form">
            <label>
            <span>Username</span>
            <input
                type="text"
                name="username"
                [(ngModel)]="form.username"
                required
            />
            </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              [(ngModel)]="form.password"
              required
            />
          </label>

          <button type="submit" [disabled]="loginForm.invalid">Log In</button>
        </form>

        <p class="switch-link">
          Need an account?
          <a routerLink="/register">Create one</a>
        </p>

        @if (message) {
          <p class="status">{{ message }}</p>
        }
      </section>
    </main>
  `,
  styles: `
    .auth-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: linear-gradient(160deg, #f4efe6 0%, #dbe7f0 100%);
    }

    .auth-card {
      width: min(100%, 420px);
      padding: 32px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 24px 60px rgba(22, 37, 66, 0.14);
    }

    .eyebrow {
      margin: 0 0 8px;
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #5c6b73;
    }

    h1 {
      margin: 0;
    }

    .subtitle {
      margin: 8px 0 24px;
      color: #4f5d75;
    }

    .auth-form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 8px;
      color: #22333b;
    }

    input {
      padding: 12px 14px;
      border: 1px solid #c9d6df;
      border-radius: 12px;
      font: inherit;
    }

    button {
      padding: 12px 16px;
      border: 0;
      border-radius: 999px;
      background: #22333b;
      color: #fff;
      font: inherit;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .switch-link,
    .status {
      margin: 20px 0 0;
    }

    a {
      color: #1c6e8c;
    }
  `,
})
export class LoginPageComponent {
  protected form = {
    username: '',
    password: '',
  };

  protected message = '';

  protected onSubmit(): void {
    this.message = `Ready to log in ${this.form.username}. Next we will connect this form to the backend.`;
  }
}