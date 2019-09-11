import { Component, OnInit } from "@angular/core";
import { PessoaService } from "../_services/pessoa.service";
import { DomSanitizer } from "@angular/platform-browser";
import { RoteamentoService } from "../_services/roteamento.service";
import { environment } from "../../environments/environment";
import { DominioService } from "../_services/dominio.service";
import { SocketService } from "../_services/socket.service";
import { NotificacaoService } from "../_services/notificacao.service";
import uniqBy from "lodash/uniqBy";

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

      this.notificacoes = uniqBy([...this.notificacoes, ...msg], "id");

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
      return;
    }

    const mensagem = {
      ack: [id]
    };

    this.socketService.enviar(mensagem);

    this.contadorPendencias -= 1;

    this.notificacoes = this.notificacoes.filter(item => item !== notificacao);

    this.roteamentoService.navegarParaPergunta(pergunta);
  }

  private escutarConexao() {
    if (!this.pessoaLogada) return;
    this.socketService.onMensagem().subscribe(data => {
      const { payload, type: tipo } = data;

      if (tipo === "DENUNCIA") {
        const { titulo } = payload;
        const { id } = data;
        payload["frase"] = `A pergunta: ${titulo.bold()} recebeu uma denúncia`;
        payload["pergunta"] = payload["id"];
        payload["id"] = id;
        this.notificacoes = [payload, ...this.notificacoes];
        this.contadorPendencias = this.contadorPendencias + 1;
        return;
      }

      if (tipo === "PENDENCIAS") {
        payload.forEach(pendencia => {
          pendencia[
            "frase"
          ] = `A pergunta: ${pendencia.titulo.bold()} recebeu uma denúncia`;
          this.notificacoes = [pendencia, ...this.notificacoes];
          this.contadorPendencias = this.contadorPendencias + 1;
        });
        return;
      }
    });
  }
}

// 192.168.0.138
// adson - root1234
