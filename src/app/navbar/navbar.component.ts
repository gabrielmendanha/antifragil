import { Component, OnInit } from "@angular/core";
import { PessoaService } from "../_services/pessoa.service";
import { DomSanitizer } from "@angular/platform-browser";
import { RoteamentoService } from "../_services/roteamento.service";
import { environment } from "../../environments/environment";
import { DominioService } from "../_services/dominio.service";
import { SocketService } from "../_services/socket.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent implements OnInit {
  private urlPerfil: string;
  protected pessoaLogada: boolean = false;
  protected categorias: Array<any> = [];
  private baseApiUrl: string = environment.BACKEND_URL;
  public url = `${this.baseApiUrl}autoria/perguntas/`;
  public search = "";
  opened: boolean = false;

  constructor(
    private pessoaService: PessoaService,
    private sanitizer: DomSanitizer,
    private roteamentoService: RoteamentoService,
    private dominioService: DominioService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.getCategorias();
    this.verificaPessoaLogada();
  }

  verificaPessoaLogada() {
    if (this.pessoaService.existePessoaLogada()) {
      this.urlPerfil = this.pessoaService.getPessoaCorrenteImagemURL();
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

  private escutarConexao() {
    this.socketService.onMensagem().subscribe(mensagem => {
      console.log(mensagem);
    });
  }
}
