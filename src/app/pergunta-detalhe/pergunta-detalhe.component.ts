import { Component, OnInit } from "@angular/core";
import { FeedService } from "../_services/feed.service";
import { ActivatedRoute } from "@angular/router";
import { PessoaService } from "../_services/pessoa.service";

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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getPessoaCorrente().then(pessoa => {
      this.pessoaCorrente = pessoa;
    });

    this.perguntaId = this.route.snapshot.paramMap.get("id");

    this.getPergunta();
  }

  async getPessoaCorrente() {
    const response = (await this.pessoaService.verificarPessoaCorrente()).toPromise();
    return response;
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
        await this.feedService.criarResposta(data).toPromise()
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
}
