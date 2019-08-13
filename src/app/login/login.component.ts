import { Component, OnInit } from "@angular/core";
import { AuthService, FacebookLoginProvider } from "angular-6-social-login";
import { Router } from "@angular/router";
import { AuthenticationService } from "../_services/authentication.service";
import { TokenService } from "../_services/token.service";
import { PessoaService } from "../_services/pessoa.service";
import { RoteamentoService } from "../_services/roteamento.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
  socialPlatformProvider: any = FacebookLoginProvider.PROVIDER_ID;
  protected loading = false;
  protected loadingSocial = false;
  protected mostrarErroLoginSocial = false;
  protected manterSessao = true;
  protected errorResponse: any;

  pessoaLoginForm = new FormGroup({
    username: new FormControl(null),
    password: new FormControl("")
  });

  constructor(
    private authenticationService: AuthenticationService,
    private socialAuthService: AuthService,
    private tokenService: TokenService,
    private pessoaService: PessoaService,
    private router: Router,
    private roteamentoService: RoteamentoService
  ) {}

  ngOnInit() {}

  public async login() {
    try {
      this.setLoading();

      const response = <any>(
        await this.authenticationService
          .login(this.pessoaLoginForm.value)
          .toPromise()
      );

      this.tokenService.setToken(response.token, this.manterSessao);

      this.pessoaService.setPessoaCorrente(response.user);

      this.navigateTo();
    } catch (error) {
      this.errorResponse = error.error;
      this.removerLoading();
    }
  }

  public async socialSignIn() {
    try {
      this.loadingSocial = true;
      const userData = await this.socialAuthService.signIn(
        this.socialPlatformProvider
      );

      console.log(userData);

      const data = {
        access_token: userData.token
      };

      const response = <any>(
        await this.authenticationService.authenticateFacebook(data)
      );

      console.log(response);

      this.tokenService.setToken(response.token);

      const pessoa = {
        nome: userData.name,
        imagem: userData.image,
        id: response.user.id,
        socialId: userData.id
      };

      this.pessoaService.setPessoaCorrente(pessoa);

      this.pessoaService.setPessoaCorrenteImagemURL(pessoa.imagem);

      this.navigateTo();
    } catch {
      this.mostrarErroLoginSocial = true;
      this.tokenService.clearToken();
    } finally {
      this.loadingSocial = false;
    }
  }

  public navigateTo() {
    this.router.navigate(["feed/ranking"]);
  }

  public navegarCadastro() {
    this.roteamentoService.navegarCadastro();
  }

  public navegarRecuperarSenha() {
    this.roteamentoService.navegarRecuperarSenha();
  }

  private setLoading() {
    this.loading = true;
  }

  private removerLoading() {
    this.loading = false;
  }
}
