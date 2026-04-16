import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    return this.authService.currentUser$.pipe(
      take(1),
      map(state => {
        if (state.authenticated) return true;
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/add-prompt' } });
        return false;
      })
    );
  }
}