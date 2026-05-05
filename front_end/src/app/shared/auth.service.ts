import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { UserService } from './user.service';

// Shape of what the backend sends back after login or register
interface AuthResponse {
  tokenType: string;
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly tokenKey = 'auth_token';

  constructor(private http: HttpClient, private userService: UserService) {}

  login(username: string, password: string): Observable<unknown> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(res => this.saveToken(res.accessToken)),
        switchMap(() => this.userService.fetchMe()),
      );
  }

  register(
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Observable<unknown> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        username,
        email,
        password,
        firstName,
        lastName,
      })
      .pipe(
        tap(res => this.saveToken(res.accessToken)),
        switchMap(() => this.userService.fetchMe()),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userService.clearMe();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
}
