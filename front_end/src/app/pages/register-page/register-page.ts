import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <p class="eyebrow">Workout App</p>
        <h1>Create Account</h1>
        <p class="subtitle">These fields match the backend register request.</p>

        <form #registerForm="ngForm" (ngSubmit)="onSubmit()" class="auth-form">
          <label>
            <span>Username</span>
            <input type="text" name="username" [(ngModel)]="form.username" required />
          </label>

          <label>
            <span>Email</span>
            <input type="email" name="email" [(ngModel)]="form.email" required />
          </label>

          <label>
            <span>Password</span>
            <input type="password" name="password" [(ngModel)]="form.password" required />
          </label>

          <label>
            <span>First Name</span>
            <input type="text" name="firstName" [(ngModel)]="form.firstName" required />
          </label>

          <label>
            <span>Last Name</span>
            <input type="text" name="lastName" [(ngModel)]="form.lastName" required />
          </label>

          <button type="submit" [disabled]="registerForm.invalid">Register</button>
        </form>

        <p class="switch-link">
          Already have an account?
          <a routerLink="/login">Go to login</a>
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
      width: min(100%, 460px);
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
export class RegisterPageComponent {
  protected form = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  };

  protected message = '';

  protected onSubmit(): void {
    this.message = `Ready to register ${this.form.username}. Next we will send this data to the backend.`;
  }
}