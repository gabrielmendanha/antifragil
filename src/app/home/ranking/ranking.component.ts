import { Component, OnInit, OnChanges, OnDestroy } from "@angular/core";
import { FeedService } from "src/app/_services/feed.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import isEmpty from "lodash/isEmpty";
import { PessoaService } from "src/app/_services/pessoa.service";

@Component({
  selector: "app-ranking",
  templateUrl: "./ranking.component.html"
})
export class RankingComponent implements OnInit, OnChanges, OnDestroy {
  protected perguntas: Array<any> = [];
  protected filtroAtual: string = "data_criacao";
  protected loading: boolean = true;
  protected mostrarErro: boolean = false;
  private feedServiceSubscription: Subscription;

  constructor(
    private feedService: FeedService,
    private router: Router,
    private route: ActivatedRoute,
    private pessoaService: PessoaService
  ) {}

  ngOnInit() {
    this.getPerguntas();
    this.escutarEventoAtualizarPergunta();
  }

  ngOnChanges() {
    this.getPerguntas();
  }

  ngOnDestroy() {
    this.feedServiceSubscription.unsubscribe();
  }

  escutarEventoAtualizarPergunta() {
    this.feedServiceSubscription = this.route.queryParams.subscribe(texto => {
      if (isEmpty(texto)) {
        return;
      }
      if (isEmpty(texto.searchTo)) {
        this.getPerguntasSemTextoComCategorias();
      }
      this.getPerguntasPorTexto(texto.searchTo);
    });
  }

  async getPerguntasSemTextoComCategorias() {
    alert("TODO");
  }

  async getPerguntasPorTexto(texto) {
    this.loading = true;
    try {
      this.perguntas = <any>(
        await this.feedService.searchPerguntas(texto).toPromise()
      );
    } catch {
      this.perguntas = [];
      this.mostrarErro = true;
    } finally {
      this.loading = false;
    }
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
    if (!this.pessoaService.existePessoaLogada()) {
      return;
    }
    this.router.navigate([`pergunta/${id}`]);
  }
}
