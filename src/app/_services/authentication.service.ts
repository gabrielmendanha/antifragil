import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthenticationService {
  baseApiUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = environment.BACKEND_URL;
  }

  async authenticateFacebook(data) {
    return this.httpClient
      .post(`${this.baseApiUrl}autenticacao/facebook/`, data)
      .pipe(
        catchError(error => {
          return Observable.throw(error);
        })
      )
      .toPromise();
  }
}
