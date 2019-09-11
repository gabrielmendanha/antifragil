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

  ngOnInit() {
    this.getCategorias();
    this.verificaPessoaLogada();
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
      this.socketService.iniciarConexao();
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

    this.roteamentoService.navegarParaPergunta(pergunta);
  }

  private escutarConexao() {
    if (!this.pessoaLogada) return;
    this.socketService.enviarToken();
    this.socketService.onMensagem().subscribe(data => {
      const { payload, type: tipo, titulo } = data;

      if (tipo === "DENUNCIA") {
        payload["frase"] = `A pergunta: ${titulo} recebeu uma denúncia`;
        payload["tipo"] = "denuncia";
        payload["id"] = payload["pergunta"];
        this.notificacoes = [...this.notificacoes, payload];
        this.contadorPendencias = this.contadorPendencias + 1;
        return;
      }

      this.notificacoes = payload;
      this.contadorPendencias = payload.length;
    });
  }
}

// 192.168.0.138
// adson - root1234
