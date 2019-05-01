import { Component, OnInit, AfterContentInit } from "@angular/core";
import { AuthService, FacebookLoginProvider } from "angular-6-social-login";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
  socialPlatformProvider: any = FacebookLoginProvider.PROVIDER_ID;

  constructor(private socialAuthService: AuthService, private router: Router) {}

  ngOnInit() {}

  public socialSignIn() {
    this.socialAuthService
      .signIn(this.socialPlatformProvider)
      .then(userData => {
        console.log(userData);
      });
  }

  public navigateTo() {
    this.router.navigate(["cadastrar"]);
  }
}
