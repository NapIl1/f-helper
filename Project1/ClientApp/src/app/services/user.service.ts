import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly USERNAME_KEY = 'PILOT_USERNAME';

  constructor() { }

  public login(userName: string): void {
    localStorage.setItem(this.USERNAME_KEY, userName);
  }

  public getUserName(): string | null {
    return localStorage.getItem(this.USERNAME_KEY) ?? null;
  }
} 
