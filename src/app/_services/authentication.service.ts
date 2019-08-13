import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthenticationService {
  baseApiUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = environment.BACKEND_URL;
  }

  cadastrar(data) {
    return this.httpClient
      .post(`${this.baseApiUrl}autenticacao/registration/`, data)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  login(data) {
    return this.httpClient
      .post(`${this.baseApiUrl}autenticacao/login/`, data)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  async authenticateFacebook(data) {
    return this.httpClient
      .post(`${this.baseApiUrl}autenticacao/facebook/`, data)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      )
      .toPromise();
  }

  recuperar_senha(data) {
    return this.httpClient
      .post(`${this.baseApiUrl}autenticacao/password/reset/`, data)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }
}
