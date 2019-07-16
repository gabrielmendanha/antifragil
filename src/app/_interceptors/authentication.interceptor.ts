import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { TokenService } from "../_services/token.service";
import { PessoaService } from "../_services/pessoa.service";

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private router: Router, private tokenService: TokenService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const setHeaders = this.getHeaders();
    request = request.clone({ setHeaders });

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(["/"]);
          }
          return throwError(error);
        }
      })
    );
  }

  getHeaders() {
    let headers = {};
    if (this.router.url === "/") return headers;
    if (this.router.url === "/cadastrar") return headers;
    if (this.tokenService.getToken()) {
      headers = {
        "Content-Type": "application/json",
        Authorization: `Token ${this.tokenService.getToken()}`
      };
    } else {
      headers = {
        "Content-Type": "application/json"
      };
    }

    return headers;
  }
}
