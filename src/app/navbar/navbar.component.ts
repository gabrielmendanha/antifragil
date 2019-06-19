import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewChild,
  AfterContentChecked,
  ElementRef
} from "@angular/core";
import { PessoaService } from "../_services/pessoa.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent implements OnInit {
  private urlPerfil: string;
  public url = "http://suggestqueries.google.com/complete/search";
  public params = {
    hl: "en",
    ds: "yt",
    xhr: "t",
    client: "youtube"
  };
  public search = "";
  opened: boolean = false;

  constructor(
    private pessoaService: PessoaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // this.urlPerfil = this.pessoaService.getPessoaCorrente().value.imagem;
  }

  perfilUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.urlPerfil);
  }

  handleResultSelected(result) {
    this.search = result;
  }

  onKeydown() {
    this.opened = true;
  }
}
