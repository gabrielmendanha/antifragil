import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PessoaService {
  constructor() {}

  private pessoaCorrente: BehaviorSubject<any>;

  setPessoaCorrente(user: any) {
    if (!this.pessoaCorrente) {
      this.pessoaCorrente = new BehaviorSubject<any>(user);
    } else {
      this.pessoaCorrente.next(user);
    }
  }

  getPessoaCorrente(): BehaviorSubject<any> {
    return this.pessoaCorrente;
  }
}
