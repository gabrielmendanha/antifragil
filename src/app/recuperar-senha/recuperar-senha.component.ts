import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { RoteamentoService } from "../_services/roteamento.service";
import { AuthenticationService } from "../_services/authentication.service";

@Component({
  selector: "app-recuperar-senha",
  templateUrl: "./recuperar-senha.component.html",
  styleUrls: ["./recuperar-senha.component.css"]
})
export class RecuperarSenhaComponent implements OnInit {
  recuperarEmailForm = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required])
  });

  private _loading = false;
  private _error = false;
  protected errorResponse;
  protected resposta;

  constructor(
    private roteamentoService: RoteamentoService,
    private autenticacaoService: AuthenticationService
  ) {}

  ngOnInit() {}

  public navegarPaginaLogin() {
    this.roteamentoService.navegarParaPaginaCadastro();
  }

  public async onSubmit() {
    try {
      this._removeError();
      this._setLoading();
      this.resposta = await this.autenticacaoService
        .recuperar_senha(this.recuperarEmailForm.value)
        .toPromise();

      this.recuperarEmailForm.reset();
    } catch (error) {
      this.errorResponse = error.error;
      this._setError();
    } finally {
      this._removeLoading();
    }
  }

  private _setLoading() {
    this.resposta = null;
    this._loading = true;
  }

  private _removeLoading() {
    this._loading = false;
  }

  private _setError() {
    this._error = true;
  }

  private _removeError() {
    this.errorResponse = null;
    this._error = false;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }
}
