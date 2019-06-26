import { Component, OnInit, OnChanges } from "@angular/core";
import { FeedService } from "src/app/_services/feed.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-ranking",
  templateUrl: "./ranking.component.html"
})
export class RankingComponent implements OnInit, OnChanges {
  protected perguntas: Array<any> = [];
  protected filtroAtual: string = "data_criacao";
  protected loading: boolean = true;
  protected mostrarErro: boolean = false;

  constructor(private feedService: FeedService, private router: Router) {}

  async ngOnInit() {
    this.getPerguntas();
  }

  ngOnChanges() {
    this.getPerguntas();
  }

  async getPerguntas() {
    this.loading = true;
    try {
      this.perguntas = <any>(
        await this.feedService.getRanking(this.filtroAtual).toPromise()
      );
    } catch {
      this.perguntas = [];
      this.mostrarErro = true;
    } finally {
      this.loading = false;
    }
  }

  async getPerguntasPage(url) {
    if (!url) return;

    this.loading = true;
    try {
      this.perguntas = <any>(
        await this.feedService.getRankingPage(url).toPromise()
      );
    } catch {
      this.perguntas = [];
      this.mostrarErro = true;
    } finally {
      this.loading = false;
    }
  }

  navegarDetalhePergunta(id) {
    this.router.navigate([`pergunta/${id}`]);
  }
}
