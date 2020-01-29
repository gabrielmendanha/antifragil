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
    this.router.navigate(["/feed/pergunta/"]);
  }

  navegarParaPergunta(perguntaId) {
    this.router.navigate([`/feed/pergunta/${perguntaId}/`]);
  }

  navegarFeed() {
    this.router.navigate(["/feed/ranking/"]);
  }

  navegarFeedComTexto(texto) {
    this.router.navigate(["/feed/ranking/"], {
      queryParams: { searchTo: texto }
    });
  }

  navegarCadastro() {
    this.router.navigate(["/cadastrar/"]);
  }

  navegarRecuperarSenha() {
    this.router.navigate(["/recuperar-senha/"]);
  }
}
