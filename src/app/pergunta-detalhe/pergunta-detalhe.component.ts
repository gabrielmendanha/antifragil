import { Component, OnInit, Renderer2 } from "@angular/core";
import { FeedService } from "../_services/feed.service";
import { ActivatedRoute } from "@angular/router";
import { PessoaService } from "../_services/pessoa.service";
import remove from "lodash/remove";

@Component({
  selector: "app-pergunta-detalhe",
  templateUrl: "./pergunta-detalhe.component.html",
  styleUrls: ["./pergunta-detalhe.component.css"]
})
export class PerguntaDetalheComponent implements OnInit {
  protected pergunta: any = {};
  protected perguntaId: any;
  protected loading: boolean = true;
  protected loadingPublicacaoResposta: boolean = false;
  protected mostrarErroPublicacaoResposta: boolean = false;
  protected mostrarErro: boolean = false;
  protected resposta: string;
  protected disableTextArea: boolean = false;
  protected pessoaCorrente: any = {};

  constructor(
    private feedService: FeedService,
    private pessoaService: PessoaService,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {}

  async ngOnInit() {
    this.getPessoaCorrente();

    this.perguntaId = this.route.snapshot.paramMap.get("id");

    this.getPergunta();
  }

  async getPessoaCorrente() {
    this.pessoaCorrente = await this.pessoaService.getPessoaCorrente();
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
    } catch {
      // TODO notificar caso falhe ou dê certo na central de notificações
    } finally {
      this.renderer.removeAttribute(botao, "disabled");
      this.renderer.removeClass(botao, "btn-loading");
    }
  }
}
