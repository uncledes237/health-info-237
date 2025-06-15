import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
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