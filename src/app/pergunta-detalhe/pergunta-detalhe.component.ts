import { Component, OnInit } from "@angular/core";
import { FeedService } from "../_services/feed.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-pergunta-detalhe",
  templateUrl: "./pergunta-detalhe.component.html",
  styleUrls: ["./pergunta-detalhe.component.css"]
})
export class PerguntaDetalheComponent implements OnInit {
  protected pergunta: any = {};
  protected perguntaId: any;
  protected loading: boolean = true;
  protected mostrarErro: boolean = false;

  constructor(
    private feedService: FeedService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.perguntaId = this.route.snapshot.paramMap.get("id");
    this.getPergunta();
  }

  async getPergunta() {
    this.loading = true;
    try {
      this.pergunta = <any>(
        await this.feedService.getPerguntaDetalhe(this.perguntaId).toPromise()
      );
    } catch {
      this.mostrarErro = true;
    } finally {
      this.loading = false;
    }
  }
}
