import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class RoteamentoService {
  constructor(private router: Router) {}

  navegarParaNovaPergunta() {
    this.router.navigate(["/pergunta"]);
  }

  navegarParaPergunta(perguntaId) {
    this.router.navigate([`/pergunta/${perguntaId}`]);
  }
}
