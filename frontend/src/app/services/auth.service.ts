import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { AuthState } from '../models/prompt.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api/auth';
  private authState$ = new BehaviorSubject<AuthState>({ authenticated: false, user: null });

  readonly currentUser$ = this.authState$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get isAuthenticated(): boolean {
    return this.authState$.value.authenticated;
  }

  get currentUser() {
    return this.authState$.value.user;
  }

  checkAuth(): Observable<AuthState> {
    return this.http.get<AuthState>(`${this.baseUrl}/me/`).pipe(
      tap(state => this.authState$.next(state)),
      catchError(() => {
        this.authState$.next({ authenticated: false, user: null });
        return of({ authenticated: false, user: null });
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login/`, { username, password }).pipe(
      tap(res => {
        this.authState$.next({ authenticated: true, user: res.user });
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/logout/`, {}).pipe(
      tap(() => {
        this.authState$.next({ authenticated: false, user: null });
        this.router.navigate(['/prompts']);
      })
    );
  }
}