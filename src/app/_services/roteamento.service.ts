import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class RoteamentoService {
  constructor(private router: Router) {}

  navegarParaPaginaCadastro() {
    this.router.navigate(["/"]);
  }

  navegarParaNovaPergunta() {
    this.router.navigate(["/pergunta/"]);
  }

  navegarParaPergunta(perguntaId) {
    this.router.navigate([`/pergunta/${perguntaId}/`]);
  }

  navegarFeed() {
    this.router.navigate(["/feed/ranking/"]);
  }

  navegarFeedComTexto(texto) {
    this.router.navigate([`/feed/ranking/`], {
      queryParams: { searchTo: texto }
    });
  }
}
