import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { CadastroComponent } from "./cadastro/cadastro.component";
import { HomeComponent } from "./home/home.component";
import { RankingComponent } from "./home/ranking/ranking.component";
import { PerguntaDetalheComponent } from "./pergunta-detalhe/pergunta-detalhe.component";
import { CriarPerguntaComponent } from "./criar-pergunta/criar-pergunta.component";
import { RecuperarSenhaComponent } from "./recuperar-senha/recuperar-senha.component";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "cadastrar", component: CadastroComponent },
  { path: "recuperar-senha", component: RecuperarSenhaComponent },
  { path: "pergunta", component: CriarPerguntaComponent },
  { path: "pergunta/:id", component: PerguntaDetalheComponent },
  {
    path: "feed",
    component: HomeComponent,
    children: [
      {
        path: "ranking",
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
