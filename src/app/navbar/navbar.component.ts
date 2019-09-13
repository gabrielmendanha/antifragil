import { Component, OnInit } from "@angular/core";
import { PessoaService } from "../_services/pessoa.service";
import { DomSanitizer } from "@angular/platform-browser";
import { RoteamentoService } from "../_services/roteamento.service";
import { environment } from "../../environments/environment";
import { DominioService } from "../_services/dominio.service";
import { SocketService } from "../_services/socket.service";
import { NotificacaoService } from "../_services/notificacao.service";
import uniqBy from "lodash/uniqBy";
import flatten from "lodash/flatten";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent implements OnInit {
  private urlPerfil: string;
  protected pessoaLogada: boolean = false;
  protected pessoa: any;
  protected categorias: Array<any> = [];
  private baseApiUrl: string = environment.BACKEND_URL;
  public url = `${this.baseApiUrl}autoria/perguntas/`;
  public search = "";
  opened: boolean = false;
  protected contadorPendencias = 0;
  protected notificacoes: Array<any> = [];

  constructor(
    private pessoaService: PessoaService,
    private sanitizer: DomSanitizer,
    private roteamentoService: RoteamentoService,
    private dominioService: DominioService,
    private socketService: SocketService,
    private notificacaoService: NotificacaoService
  ) {}

  async ngOnInit() {
    this.getCategorias();
    await this.verificaPessoaLogada();
    this.socketService.iniciarConexao();
    this.escutarConexao();
    this.escutarNotificacoes();
  }

  escutarNotificacoes() {
    this.notificacaoService.getNotificacaoSubject().subscribe(msg => {
      const { tipo } = msg;
      if (tipo !== "MESSAGE") return;

      this.notificacoes = uniqBy([msg, ...this.notificacoes], "id");

      this.contadorPendencias = this.notificacoes.length;
    });
  }

  async verificaPessoaLogada() {
    if (this.pessoaService.existePessoaLogada()) {
      this.urlPerfil = this.pessoaService.getPessoaCorrenteImagemURL();
      this.pessoa = await this.pessoaService.getPessoaCorrente();
      this.pessoaLogada = true;
    } else {
      this.urlPerfil = "assets/images/generic-user.svg";
    }
  }

  perfilUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.urlPerfil);
  }

  handleResultSelected(result) {
    this.search = result.titulo;
    this.search = "";
  }

  onKeydown() {
    this.opened = true;
  }

  navegarParaNovaPergunta() {
    this.roteamentoService.navegarParaNovaPergunta();
  }

  navegarFeed() {
    this.roteamentoService.navegarFeed();
  }

  async getCategorias() {
    this.categorias = await this.dominioService.getCategorias();
  }

  logout() {
    this.pessoaService.sair();
    this.roteamentoService.navegarParaPaginaCadastro();
  }

  navegarPaginaCadastro() {
    this.roteamentoService.navegarParaPaginaCadastro();
  }

  navegarCadastro() {
    this.roteamentoService.navegarCadastro();
  }

  protected navegarParaNotificacao(notificacao) {
    const { pergunta, id, tipo } = notificacao;

    if (tipo === "MESSAGE") {
      this.contadorPendencias -= 1;
      this.notificacoes = this.notificacoes.filter(
        item => item !== notificacao
      );
      return;
    }

    const mensagem = {
      ack: flatten([id])
    };

    this.socketService.enviar(mensagem);

    this.contadorPendencias -= 1;

    this.notificacoes = this.notificacoes.filter(item => item !== notificacao);

    this.roteamentoService.navegarParaPergunta(pergunta);
  }

  private atualizarNotificacao(item) {
    this.notificacoes = [item, ...this.notificacoes];

    this.contadorPendencias = this.contadorPendencias + 1;
  }

  private escutarConexao() {
    if (!this.pessoaLogada) return;
    this.socketService.onMensagem().subscribe(data => {
      const { payload, type: tipo } = data;

      if (tipo === "COMENTARIOS") {
        payload.forEach(perguntaComentarios => {
          const { titulo, total, pergunta_id: pergunta } = perguntaComentarios;

          perguntaComentarios[
            "frase"
          ] = `A pergunta: ${titulo.bold()} recebeu ${total} novos comentários!`;

          if (total === 1) {
            perguntaComentarios[
              "frase"
            ] = `A pergunta: ${titulo.bold()} recebeu ${total} novo comentário!`;
          }
          perguntaComentarios["pergunta"] = pergunta;

          perguntaComentarios["id"] = perguntaComentarios["ids"];

          this.atualizarNotificacao(perguntaComentarios);
        });
        return;
      }

      if (tipo === "COMENTARIO") {
        const { titulo, total, pergunta_id: pergunta } = payload[0];

        payload[0]["pergunta"] = pergunta;

        payload[0]["id"] = payload[0]["ids"];

        payload[0][
          "frase"
        ] = `A pergunta: ${titulo.bold()} recebeu ${total} novos comentários!`;

        if (total === 1) {
          payload[0][
            "frase"
          ] = `A pergunta: ${titulo.bold()} recebeu ${total} novo comentário!`;
        }

        this.notificacoes = this.notificacoes.filter(
          item => item.pergunta_id !== payload[0].pergunta_id
        );

        this.notificacoes = [payload[0], ...this.notificacoes];
      }

      if (tipo === "DENUNCIA") {
        const { titulo } = payload;

        const { id } = data;

        payload["frase"] = `A pergunta: ${titulo.bold()} recebeu uma denúncia`;

        payload["pergunta"] = payload["id"];

        payload["id"] = id;

        this.atualizarNotificacao(payload);

        return;
      }

      if (tipo === "PENDENCIAS") {
        payload.forEach(pendencia => {
          pendencia[
            "frase"
          ] = `A pergunta: ${pendencia.titulo.bold()} recebeu uma denúncia`;

          this.atualizarNotificacao(pendencia);
        });
        return;
      }
    });
  }
}

// 192.168.0.138
// adson - root1234
