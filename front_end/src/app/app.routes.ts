import { Routes } from '@angular/router';

import { AppShellComponent } from './layout/app-shell/app-shell';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page';
import { DayPageComponent } from './pages/day-page/day-page';
import { LoginPageComponent } from './pages/login-page/login-page';
import { ProgressPageComponent } from './pages/progress-page/progress-page';
import { RegisterPageComponent } from './pages/register-page/register-page';
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'register',
    component: RegisterPageComponent,
  },
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'calendar',
      },
      {
        path: 'calendar',
        component: CalendarPageComponent,
      },
      {
        path: 'day/:date',
        component: DayPageComponent,
      },
      {
        path: 'progress',
        component: ProgressPageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];