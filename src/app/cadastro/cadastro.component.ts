import { Component, OnInit } from "@angular/core";
import { RoteamentoService } from "../_services/roteamento.service";
import { FormGroup, FormControl } from "@angular/forms";
import { AuthenticationService } from "../_services/authentication.service";
import { TokenService } from "../_services/token.service";
import { PessoaService } from "../_services/pessoa.service";

@Component({
  selector: "app-cadastro",
  templateUrl: "./cadastro.component.html"
})
export class CadastroComponent implements OnInit {
  constructor(
    private roteamentoService: RoteamentoService,
    private authenticationService: AuthenticationService,
    private tokenService: TokenService,
    private pessoaService: PessoaService
  ) {}

  pessoaCadastroForm = new FormGroup({
    email: new FormControl(""),
    username: new FormControl(""),
    password1: new FormControl(""),
    password2: new FormControl(""),
    first_name: new FormControl(""),
    last_name: new FormControl("")
  });

  errorResponse: any;

  ngOnInit() {}

  async onSubmit() {
    try {
      const response = <any>(
        await this.authenticationService
          .cadastrar(this.pessoaCadastroForm.value)
          .toPromise()
      );

      this.tokenService.setToken(response.token);

      this.pessoaService.setPessoaCorrente(response.user);

      this.navegarFeed();
    } catch (error) {
      this.errorResponse = error.error;
    }
  }

  navegarFeed() {
    this.roteamentoService.navegarFeed();
  }

  navegarPaginaLogin() {
    this.roteamentoService.navegarParaPaginaCadastro();
  }
}
