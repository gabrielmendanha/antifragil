import { Component, OnInit } from "@angular/core";
import { RoteamentoService } from "../_services/roteamento.service";

@Component({
  selector: "app-cadastro",
  templateUrl: "./cadastro.component.html"
})
export class CadastroComponent implements OnInit {
  constructor(private roteamentoService: RoteamentoService) {}

  ngOnInit() {}

  navegarPaginaLogin() {
    this.roteamentoService.navegarParaPaginaCadastro();
  }
}
