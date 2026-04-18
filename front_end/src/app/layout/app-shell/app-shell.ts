import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet],
  template: `
    <main>
      <h1>Workout App</h1>
      <router-outlet />
    </main>
  `,
})
export class AppShellComponent {}