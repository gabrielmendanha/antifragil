import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { RoteamentoService } from "../_services/roteamento.service";
import { AuthenticationService } from "../_services/authentication.service";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";

@Component({
  selector: "app-confirmar-nova-senha",
  templateUrl: "./confirmar-nova-senha.component.html",
  styleUrls: ["./confirmar-nova-senha.component.css"]
})
export class ConfirmarNovaSenhaComponent implements OnInit {
  confirmarNovaSenhaForm = new FormGroup({
    new_password1: new FormControl(null, Validators.required),
    new_password2: new FormControl(null, Validators.required),
    uid: new FormControl(null),
    token: new FormControl(null)
  });

  private _loading = false;
  private _error = false;
  protected errorResponse;
  protected resposta;

  constructor(
    private roteamentoService: RoteamentoService,
    private autenticacaoService: AuthenticationService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    await this._capturarParametrosRota();
  }

  public navegarPaginaLogin() {
    this.roteamentoService.navegarParaPaginaCadastro();
  }

  private async _capturarParametrosRota() {
    const { uidb64, token } = await this.route.params.pipe(first()).toPromise();

    this.confirmarNovaSenhaForm.controls["uid"].setValue(uidb64);
    this.confirmarNovaSenhaForm.controls["token"].setValue(token);
  }

  public async onSubmit() {
    try {
      this._removeError();
      this._setLoading();
      this.resposta = await this.autenticacaoService
        .resetar_senha(this.confirmarNovaSenhaForm.value)
        .toPromise();

      this.confirmarNovaSenhaForm.reset();
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
