import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = "https://gesture-soundboard.vercel.app/";
  constructor(private http: HttpClient) {}

  public logout() {
    const username = localStorage.getItem('username');
    if (username) {
      localStorage.removeItem('username');
      window.location.reload();
    }
  }

  public isLoggedIn() {
    const username = localStorage.getItem('username');
    if (username) { 
      return true;
    }

    return false;
  }

  public getUsername() {
    const username = localStorage.getItem('username');
    if (username) { 
      return username;
    }

    return null;
  }

  public register(username: string, password: string) {
    console.log(username, password, this.apiUrl);
    return this.http.post(`${this.apiUrl}accounts/create`, {
      username: username,
      password: password,
    });
  }

  public login(username: string, password: string) {
    return this.http.post<string>(`${this.apiUrl}accounts/login`, {
      username: username,
      password: password,
    });
  }

  public deleteUser(username: string) {
    return this.http.delete<string>(
      `${this.apiUrl}accounts/${username}/delete`
    );
  }
}
