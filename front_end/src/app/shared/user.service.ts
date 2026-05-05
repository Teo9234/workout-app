import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly apiUrl = 'http://localhost:8080/api/users';
  private readonly userKey = 'current_user';

  constructor(private http: HttpClient) {}

  // Called once after login/register to fetch and cache who the logged-in user is
  fetchMe(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.apiUrl}/me`).pipe(
      tap(user => localStorage.setItem(this.userKey, JSON.stringify(user))),
    );
  }

  getMe(): CurrentUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  clearMe(): void {
    localStorage.removeItem(this.userKey);
  }
}
