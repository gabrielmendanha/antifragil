import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class TokenService {
  constructor() {}

  setToken(token, storeLocal = true) {
    sessionStorage.setItem(`token`, token);

    if (storeLocal) {
      localStorage.setItem(`token`, token);
    }
  }

  getToken({ session }): string {
    return (
      localStorage.getItem(`:${session}:token`) ||
      sessionStorage.getItem(`:${session}:token`)
    );
  }

  clearToken(session = null): void {
    localStorage.removeItem(`:${session}:token`);
    sessionStorage.removeItem(`:${session}:token`);
  }
}
