import { Injectable } from '@angular/core';
import { Router, CanActivate, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('token') !== null;
    
    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      return this.router.createUrlTree(['/login']);
    }
    
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user?.role?.toLowerCase() === 'admin') {
          return true;
        } else {
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class HealthOfficialGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user?.role === 'admin' || user?.role === 'health_official') {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      })
    );
  }
} 