import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { NgxTypeaheadModule } from "ngx-typeahead";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { AppRoutingModule } from "./app-routing.module";
import { AngularFontAwesomeModule } from "angular-font-awesome";
import {
  SocialLoginModule,
  AuthServiceConfig,
  FacebookLoginProvider
} from "angular-6-social-login";
import { NavbarComponent } from "./navbar/navbar.component";
import { CadastroComponent } from './cadastro/cadastro.component';
import { HomeComponent } from './home/home.component';
import { RankingComponent } from './home/ranking/ranking.component';

export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig([
    {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider("767147586986883")
    }
  ]);
  return config;
}

@NgModule({
  declarations: [AppComponent, LoginComponent, NavbarComponent, CadastroComponent, HomeComponent, RankingComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocialLoginModule,
    AngularFontAwesomeModule,
    NgxTypeaheadModule
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
