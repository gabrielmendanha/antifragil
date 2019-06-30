import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class TokenService {
  constructor() {}

  setToken(token, storeLocal = true) {
    sessionStorage.setItem(`token_antifragil`, token);

    if (storeLocal) {
      localStorage.setItem(`token_antifragil`, token);
    }
  }

  getToken(): string {
    return (
      localStorage.getItem(`token_antifragil`) ||
      sessionStorage.getItem(`token_antifragil`)
    );
  }

  clearToken(): void {
    localStorage.removeItem(`token_antifragil`);
    sessionStorage.removeItem(`token_antifragil`);
  }
}
