import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef
} from "@angular/core";
import { DominioService } from "../_services/dominio.service";
import remove from "lodash/remove";
import { FeedService } from "../_services/feed.service";
import { RoteamentoService } from "../_services/roteamento.service";

@Component({
  selector: "app-criar-pergunta",
  templateUrl: "./criar-pergunta.component.html",
  styleUrls: ["./criar-pergunta.component.css"]
})
export class CriarPerguntaComponent implements OnInit {
  protected categorias: Array<any> = [];
  protected novaPergunta: string;
  protected novaPerguntaTitulo: string;
  protected categoriasSelecionadas: Array<any> = [];
  protected exibirErro: boolean = false;
  protected loadPublicar: boolean = false;
  protected mostrarInputTitulo: boolean = false;
  @ViewChild("perguntaTitulo") inputTitulo: ElementRef;

  constructor(
    private dominioService: DominioService,
    private renderer: Renderer2,
    private feedService: FeedService,
    private roteamentoService: RoteamentoService
  ) {}

  ngOnInit() {
    this.getCategorias();
  }

  editar() {
    this.mostrarInputTitulo = true;
    setTimeout(() => {
      this.inputTitulo.nativeElement.focus();
    }, 0);
  }

  async getCategorias() {
    this.categorias = await this.dominioService.getCategorias();
  }

  setSelecionado(categoriaSelecionada) {
    const botao = document.getElementById(categoriaSelecionada.id);

    if (botao.classList.contains("tag--active")) {
      this.renderer.removeClass(botao, "tag--active");
      this.categoriasSelecionadas = remove(
        this.categoriasSelecionadas,
        categoria => {
          return categoria.id !== categoriaSelecionada.id;
        }
      );
    } else {
      this.renderer.addClass(botao, "tag--active");
      this.categoriasSelecionadas.push(categoriaSelecionada);
    }
  }

  async criarPergunta() {
    this.loadPublicar = true;
    const data = {
      descricao: this.novaPergunta,
      categorias: this.categoriasSelecionadas,
      titulo: this.novaPerguntaTitulo
    };

    try {
      const perguntaCriada = <any>(
        await this.feedService.criarPergunta(data).toPromise()
      );
      this.roteamentoService.navegarParaPergunta(perguntaCriada.id);
    } catch {
      this.exibirErro = true;
      this.loadPublicar = false;
    }
  }
}
