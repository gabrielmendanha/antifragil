import { Component, OnInit } from "@angular/core";
import { FeedService } from "src/app/_services/feed.service";

@Component({
  selector: "app-ranking",
  templateUrl: "./ranking.component.html"
})
export class RankingComponent implements OnInit {
  protected perguntas: Array<any> = [];
  protected filtroAtual: any = "data";

  constructor(private feedService: FeedService) {}

  async ngOnInit() {
    this.perguntas = <any>await this.feedService.getRanking().toPromise();
    console.log(this.filtroAtual);
    console.log(this.perguntas);
    console.log(this.perguntas[this.filtroAtual]);
  }
}
