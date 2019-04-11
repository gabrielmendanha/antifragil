import { Component, OnInit, AfterContentInit } from "@angular/core";
import { AuthService, FacebookLoginProvider } from "angular-6-social-login";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
  socialPlatformProvider: any = FacebookLoginProvider.PROVIDER_ID;

  constructor(private socialAuthService: AuthService) {}

  ngOnInit() {}

  public socialSignIn() {
    this.socialAuthService
      .signIn(this.socialPlatformProvider)
      .then(userData => {
        console.log(userData);
      });
  }
}
