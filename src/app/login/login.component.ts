import { Component, OnInit } from "@angular/core";
import { AuthService, FacebookLoginProvider } from "angular-6-social-login";
import { Router } from "@angular/router";
import { AuthenticationService } from "../_services/authentication.service";
import { TokenService } from "../_services/token.service";
import { PessoaService } from "../_services/pessoa.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
  socialPlatformProvider: any = FacebookLoginProvider.PROVIDER_ID;
  private loading: boolean = false;
  private mostrarErroLoginSocial: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private socialAuthService: AuthService,
    private tokenService: TokenService,
    private pessoaService: PessoaService,
    private router: Router
  ) {}

  ngOnInit() {}

  public async socialSignIn() {
    try {
      this.loading = true;
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
        id: response.user.id
      };

      this.pessoaService.setPessoaCorrente(pessoa);

      this.navigateTo();
    } catch {
      this.mostrarErroLoginSocial = true;
      this.tokenService.clearToken();
    } finally {
      this.loading = false;
    }
  }

  public navigateTo() {
    this.router.navigate(["feed/ranking"]);
  }
}
