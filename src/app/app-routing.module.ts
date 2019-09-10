import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { CadastroComponent } from "./cadastro/cadastro.component";
import { HomeComponent } from "./home/home.component";
import { RankingComponent } from "./home/ranking/ranking.component";
import { PerguntaDetalheComponent } from "./home/pergunta-detalhe/pergunta-detalhe.component";
import { CriarPerguntaComponent } from "./home/criar-pergunta/criar-pergunta.component";
import { RecuperarSenhaComponent } from "./recuperar-senha/recuperar-senha.component";
import { ConfirmarNovaSenhaComponent } from "./confirmar-nova-senha/confirmar-nova-senha.component";

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "cadastrar", component: CadastroComponent },
  {
    path: "autenticacao/password-reset/:uidb64/:token",
    component: ConfirmarNovaSenhaComponent
  },
  { path: "recuperar-senha", component: RecuperarSenhaComponent },

  {
    path: "feed",
    component: HomeComponent,
    children: [
      {
        path: "ranking",
        component: RankingComponent
      },
      { path: "pergunta/:id", component: PerguntaDetalheComponent },
      { path: "pergunta", component: CriarPerguntaComponent }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {}
