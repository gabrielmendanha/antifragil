import { Injectable } from "@angular/core";
import { BehaviorSubject, throwError, Observable, of } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class PessoaService {
  baseApiUrl: string;
  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = environment.BACKEND_URL;
  }

  private pessoaCorrente: BehaviorSubject<any>;

  setPessoaCorrente(user: any) {
    if (!this.pessoaCorrente) {
      this.pessoaCorrente = new BehaviorSubject<any>(user);
    } else {
      this.pessoaCorrente.next(user);
    }
  }

  verificarPessoaCorrente() {
    if (this.pessoaCorrente) {
      return of(this.getPessoaCorrente());
    }
    return this.httpClient.get(`${this.baseApiUrl}autenticacao/user`).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getPessoaCorrente(): BehaviorSubject<any> {
    return this.pessoaCorrente;
  }
}
