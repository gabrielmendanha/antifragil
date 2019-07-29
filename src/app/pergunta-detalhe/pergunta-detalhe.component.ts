import { Component, OnInit, Renderer2, OnDestroy } from "@angular/core";
import { FeedService } from "../_services/feed.service";
import { ActivatedRoute } from "@angular/router";
import { PessoaService } from "../_services/pessoa.service";
import remove from "lodash/remove";
import { RoteamentoService } from "../_services/roteamento.service";
import { Subscription, throwError } from "rxjs";
import { isEmpty, findIndex } from "lodash";
import { PerguntaService } from "../_services/pergunta.service";

@Component({
  selector: "app-pergunta-detalhe",
  templateUrl: "./pergunta-detalhe.component.html",
  styleUrls: ["./pergunta-detalhe.component.css"]
})
export class PerguntaDetalheComponent implements OnInit, OnDestroy {
  protected pergunta: any = {};
  protected perguntaId: any;
  protected loading: boolean = true;
  protected loadingPublicacaoResposta: boolean = false;
  protected loadingPreferencia: boolean = false;
  protected mostrarErroPublicacaoResposta: boolean = false;
  protected mostrarErro: boolean = false;
  protected resposta: string;
  protected disableTextArea: boolean = false;
  protected pessoaCorrente: any = {};
  private routeSubscription: Subscription;
  constructor(
    private feedService: FeedService,
    private perguntaService: PerguntaService,
    private pessoaService: PessoaService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private roteamentoService: RoteamentoService
  ) {}

  async ngOnInit() {
    this.escutarMudancaRota();

    this.getPessoaCorrente();

    this.getPergunta();
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  async getPessoaCorrente() {
    this.pessoaCorrente = await this.pessoaService.getPessoaCorrente();
  }

  escutarMudancaRota() {
    this.routeSubscription = this.route.params.subscribe(signal => {
      this.perguntaId = signal.id;
      this.getPergunta();
    });
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

  async publicar() {
    this.loadingPublicacaoResposta = true;
    this.disableTextArea = true;

    const data = {
      comentario: this.resposta,
      pergunta: this.perguntaId
    };

    try {
      const resposta = <any>(
        await this.feedService.criarResposta(this.perguntaId, data).toPromise()
      );

      this.resposta = "";

      this.pergunta.comentarios.push(resposta);
      this.pergunta.quantidade_comentarios += 1;
    } catch {
      this.mostrarErroPublicacaoResposta = true;
    } finally {
      this.disableTextArea = false;
      this.loadingPublicacaoResposta = false;
    }
  }

  async excluir(respostaId) {
    const botao = document.getElementById(respostaId);
    try {
      this.renderer.addClass(botao, "btn-loading");
      this.renderer.setAttribute(botao, "disabled", "true");

      await this.feedService
        .apagarComentario(this.perguntaId, respostaId)
        .toPromise();

      this.pergunta.comentarios = remove(
        this.pergunta.comentarios,
        comentario => {
          return comentario.id !== respostaId;
        }
      );
      this.pergunta.quantidade_comentarios -= 1;
    } finally {
      this.renderer.removeAttribute(botao, "disabled");
      this.renderer.removeClass(botao, "btn-loading");
    }
  }

  async excluirPergunta(perguntaId, botaoId) {
    const botao = document.getElementById(botaoId);

    try {
      this.renderer.addClass(botao, "btn-loading");
      this.renderer.setAttribute(botao, "disabled", "true");

      await this.feedService.apagarPergunta(perguntaId).toPromise();

      this.navegarFeed();
    } catch {
      this.renderer.removeAttribute(botao, "disabled");
      this.renderer.removeClass(botao, "btn-loading");
    }
  }

  protected async curtirOuDescurtir() {
    this.setLoadingPreferencia();

    const { curtido } = this.pergunta;

    try {
      curtido ? await this.descurtir() : await this.curtir();
    } finally {
      this.removeLoadingPreferencia();
    }
  }

  protected async curtirOuDescurtirResposta(comentarioId) {
    this.setLoadingPreferenciaResposta(comentarioId);

    const { comentarios } = this.pergunta;

    const index = findIndex(comentarios, comentario => {
      return comentario.id === comentarioId;
    });

    const { curtido } = this.pergunta.comentarios[index];

    try {
      const resposta = (await curtido)
        ? <any>await this.descurtirResposta(comentarioId)
        : <any>await this.curtirResposta(comentarioId);

      this.pergunta.comentarios[index] = resposta;
    } finally {
      this.removeLoadingPreferenciaResposta(comentarioId);
    }
  }

  private async descurtirResposta(comentarioId) {
    try {
      return await this.perguntaService
        .descurtirResposta(this.perguntaId, comentarioId)
        .toPromise();
    } catch (error) {
      throw throwError(error);
    }
  }

  private async curtirResposta(comentarioId) {
    try {
      return await this.perguntaService
        .curtirResposta(this.perguntaId, comentarioId)
        .toPromise();
    } catch (error) {
      throw throwError(error);
    }
  }

  private async descurtir() {
    try {
      this.pergunta = await this.perguntaService
        .descurtirPergunta(this.perguntaId)
        .toPromise();
    } catch (error) {
      throw throwError(error);
    }
  }

  private async curtir() {
    try {
      this.pergunta = await this.perguntaService
        .curtirPergunta(this.perguntaId)
        .toPromise();
    } catch (error) {
      throw throwError(error);
    }
  }

  private setLoadingPreferencia() {
    this.loadingPreferencia = true;
  }

  private setLoadingPreferenciaResposta(comentarioId) {
    const botao = document.getElementById("resposta" + comentarioId);
    const botaoLoading = document.getElementById(
      "respostaLoading" + comentarioId
    );

    const botaoMobile = document.getElementById(
      "respostaMobile" + comentarioId
    );
    const botaoMobileLoading = document.getElementById(
      "respostaMobileLoading" + comentarioId
    );

    this.renderer.addClass(botao, "d-none");
    this.renderer.addClass(botaoMobile, "d-none");

    this.renderer.removeClass(botaoLoading, "d-none");
    this.renderer.removeClass(botaoMobileLoading, "d-none");
  }

  private removeLoadingPreferencia() {
    this.loadingPreferencia = false;
  }

  private removeLoadingPreferenciaResposta(comentarioId) {
    const botao = document.getElementById("resposta" + comentarioId);
    const botaoLoading = document.getElementById(
      "respostaLoading" + comentarioId
    );

    const botaoMobile = document.getElementById(
      "respostaMobile" + comentarioId
    );
    const botaoMobileLoading = document.getElementById(
      "respostaMobileLoading" + comentarioId
    );

    this.renderer.removeClass(botao, "d-none");
    this.renderer.removeClass(botaoMobile, "d-none");

    this.renderer.addClass(botaoLoading, "d-none");
    this.renderer.addClass(botaoMobileLoading, "d-none");
  }

  private navegarFeed() {
    this.roteamentoService.navegarFeed();
  }

  get desabilitarBotaoPublicar() {
    return isEmpty(this.resposta) || isEmpty(this.resposta.trim());
  }
}
