import { Injectable } from "@angular/core";
import { BehaviorSubject, throwError } from "rxjs";
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

  async verificarPessoaCorrente() {
    if (this.pessoaCorrente) {
      return this.getPessoaCorrenteSubject();
    }
    const pessoa = await this.httpClient
      .get(`${this.baseApiUrl}autenticacao/user/`)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      )
      .toPromise();
    this.setPessoaCorrente(pessoa);
  }

  async getPessoaCorrente() {
    await this.verificarPessoaCorrente();
    return this.getPessoaCorrenteSubject().value;
  }

  getPessoaCorrenteSubject(): BehaviorSubject<any> {
    return this.pessoaCorrente;
  }
}
