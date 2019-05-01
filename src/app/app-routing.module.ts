import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { CadastroComponent } from "./cadastro/cadastro.component";
import { HomeComponent } from "./home/home.component";
import { RankingComponent } from "./home/ranking/ranking.component";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "cadastrar", component: CadastroComponent },
  {
    path: "feed",
    component: HomeComponent,
    children: [
      {
        path: "",
        component: RankingComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {}
