import {
  Component,
  OnInit,
  Renderer2,
  OnDestroy,
  AfterViewChecked,
  ViewChild,
  ElementRef
} from "@angular/core";
import { FeedService } from "../../_services/feed.service";
import { ActivatedRoute } from "@angular/router";
import { PessoaService } from "../../_services/pessoa.service";
import remove from "lodash/remove";
import { RoteamentoService } from "../../_services/roteamento.service";
import { Subscription, throwError } from "rxjs";
import { isEmpty, findIndex } from "lodash";
import { PerguntaService } from "../../_services/pergunta.service";
import { NotificacaoService } from "../../_services/notificacao.service";
import { Md5 } from "ts-md5/dist/md5";

@Component({
  selector: "app-pergunta-detalhe",
  templateUrl: "./pergunta-detalhe.component.html",
  styleUrls: ["./pergunta-detalhe.component.css"]
})
export class PerguntaDetalheComponent
  implements OnInit, OnDestroy, AfterViewChecked {
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
  private _routeSubscription: Subscription;
  private _alturaAjustada = false;
  constructor(
    private feedService: FeedService,
    private perguntaService: PerguntaService,
    private pessoaService: PessoaService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private roteamentoService: RoteamentoService,
    private notificacaoService: NotificacaoService
  ) {}

  @ViewChild("header") myDiv: ElementRef;

  async ngOnInit() {
    this.escutarMudancaRota();

    this.getPessoaCorrente();

    this.getPergunta();
  }

  ngOnDestroy() {
    this._routeSubscription.unsubscribe();
  }

  ngAfterViewChecked() {
    this.ajustarAltura();
  }

  private ajustarAltura() {
    if (this._alturaAjustada) return;

    const cabecalho = document.getElementById("header");
    if (cabecalho) {
      const altura = cabecalho.offsetHeight;
      document.getElementById("respostas").style.marginTop = altura + "px";
      this._alturaAjustada = true;
    }
  }

  async getPessoaCorrente() {
    this.pessoaCorrente = await this.pessoaService.getPessoaCorrente();
  }

  escutarMudancaRota() {
    this._routeSubscription = this.route.params.subscribe(signal => {
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

  async denunciar() {
    try {
      this.pergunta = await this.perguntaService
        .denunciar(this.perguntaId)
        .toPromise();

      this.notificacaoService.enviar({
        tipo: "MESSAGE",
        frase: `A pergunta: ${this.pergunta.titulo.bold()} foi denúnciada com sucesso!`,
        id: Md5.hashStr(
          `A pergunta: ${this.pergunta.titulo.bold()} foi denúnciada com sucesso!`
        )
      });
    } catch (error) {
      this.notificacaoService.enviar({
        tipo: "MESSAGE",
        frase: `Não foi possível realizar a denúncia de ${this.pergunta.titulo.bold()}!`,
        id: Md5.hashStr(
          `Não foi possível realizar a denúncia de ${this.pergunta.titulo.bold()}!`
        )
      });
    }
  }

  async denunciarResposta(comentarioId) {
    try {
      await this.perguntaService
        .denunciarResposta(this.perguntaId, comentarioId)
        .toPromise();

      this.notificacaoService.enviar({
        tipo: "MESSAGE",
        frase: "Denúncia realizada com sucesso!",
        id: Md5.hashStr(`Denúncia realizada com sucesso!${comentarioId}`)
      });
    } catch (error) {
      this.notificacaoService.enviar({
        tipo: "MESSAGE",
        frase: `Não foi possível realizar a denúncia!`,
        id: Md5.hashStr(`Não foi possível realizar a denúncia!${comentarioId}`)
      });
    }
  }

  get desabilitarBotaoPublicar() {
    return isEmpty(this.resposta) || isEmpty(this.resposta.trim());
  }
}
