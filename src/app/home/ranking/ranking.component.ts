import { Component, OnInit, OnChanges, OnDestroy } from "@angular/core";
import { FeedService } from "src/app/_services/feed.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import isEmpty from "lodash/isEmpty";
import { PessoaService } from "src/app/_services/pessoa.service";
import { RoteamentoService } from "src/app/_services/roteamento.service";

@Component({
  selector: "app-ranking",
  templateUrl: "./ranking.component.html"
})
export class RankingComponent implements OnInit, OnChanges, OnDestroy {
  protected perguntas: Array<any> = [];
  protected filtroAtual: string = "data_criacao";
  protected loading: boolean = true;
  protected mostrarErro: boolean = false;
  private _feedServiceSubscription: Subscription;
  private _paramsSubscription: Subscription;

  constructor(
    private feedService: FeedService,
    private router: Router,
    private route: ActivatedRoute,
    private pessoaService: PessoaService
  ) {}

  ngOnInit() {
    this.getPerguntas();
    this.escutarEventoAtualizarPergunta();
    this.escutarEventoPesquisa();
  }

  ngOnChanges() {
    this.getPerguntas();
  }

  ngOnDestroy() {
    this._feedServiceSubscription.unsubscribe();
    this._paramsSubscription.unsubscribe();
  }

  escutarEventoPesquisa() {
    this._feedServiceSubscription = this.feedService.atualizarFeed.subscribe(
      texto => {
        if (isEmpty(texto)) {
          this.getPerguntas();
          return;
        }
        if (isEmpty(texto.searchTo)) {
          this.getPerguntasSemTextoComCategorias();
          return;
        }
        this.getPerguntasPorTexto(texto.searchTo);
      }
    );
  }

  escutarEventoAtualizarPergunta() {
    this._paramsSubscription = this.route.queryParams.subscribe(texto => {
      if (isEmpty(texto)) {
        this.getPerguntas();
        return;
      }
      if (isEmpty(texto.searchTo)) {
        this.getPerguntasSemTextoComCategorias();
        return;
      }
      this.getPerguntasPorTexto(texto.searchTo);
    });
  }

  async getPerguntasSemTextoComCategorias() {
    this.loading = true;

    try {
      this.perguntas = <any>(
        await this.feedService.searchPerguntasByCategoria().toPromise()
      );
    } catch {
      this.perguntas = [];
      this.mostrarErro = true;
    } finally {
      this.loading = false;
    }
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

  async navegarPagina(indice) {
    this.loading = true;
    try {
      this.perguntas = <any>(
        await this.feedService.getPagina(indice, this.filtroAtual).toPromise()
      );
    } catch {
      this.perguntas = [];
      this.mostrarErro = true;
    } finally {
      this.loading = false;
    }
  }
}
