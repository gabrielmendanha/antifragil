import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  Renderer2
} from "@angular/core";
import { of, Observable, Subject, Subscription } from "rxjs";
import {
  concat,
  debounceTime,
  filter,
  map,
  switchMap,
  tap
} from "rxjs/operators";
import { Key } from "../../../models";
import {
  createParamsForQuery,
  hasCharacters,
  isEnterKey,
  isEscapeKey,
  isIndexActive,
  resolveApiMethod,
  resolveNextIndex,
  toFormControlValue,
  toJsonpFinalResults,
  toJsonpSingleResult,
  validateArrowKeys,
  validateNonCharKeyCode,
  resolveItemValue,
  NO_INDEX
} from "../_services/ngx-typeahead.utils";
import remove from "lodash/remove";
import { RoteamentoService } from "../_services/roteamento.service";
import { FeedService } from "../_services/feed.service";
import { CategoriaService } from "../_services/categoria.service";
import { Router } from "@angular/router";

/*
 using an external template:
 <input [taItemTpl]="itemTpl" >

  <ng-template #itemTpl let-result>
    <strong>MY {{ result.result }}</strong>
  </ng-template>
*/
@Component({
  selector: "[ngxTypeahead]",
  styles: [
    `
      .ta-results {
        position: absolute;
      }
      .ta-backdrop {
        bottom: 0;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 1;
      }
      .ta-item {
        position: relative;
        z-index: 2;
        display: block;
      }
    `
  ],
  template: `
    <ng-template #suggestionsTplRef>
      <section class="ta-results list-group" *ngIf="showSuggestions">
        <div class="favorite-menu">
          <div class="pergunta__detalhe-tags">
            <button
              *ngFor="let categoria of categorias"
              id="{{ categoria.id }}"
              (click)="setSelecionado(categoria)"
              class="btn tag"
              [ngClass]="{
                'tag--active':
                  this.categoriasSelecionadas.indexOf(categoria.id) > -1
              }"
            >
              {{ categoria.nome }}
            </button>
          </div>
          <div class="collapse" id="collapseExample"></div>
          <div class="d-flex justify-content-center">
            <!--
            <button
              class="btn btn-show-suggestions"
              data-toggle="collapse"
              href="#collapseExample"
              (click)="showMais = !showMais"
            >
              {{ showMais ? "Mais" : "Menos" }}
              <i
                [ngClass]="showMais ? 'fa-angle-down' : 'fa-angle-up'"
                class="fa"
              ></i>
            </button>
            -->
          </div>
          <!-- <div class="line"></div> -->
        </div>
        <div class="ta-backdrop" (click)="hideSuggestions()"></div>
        <button
          type="button"
          class="ta-item list-group-item"
          *ngFor="let result of results; let i = index"
          [class.active]="markIsActive(i, result)"
          (click)="handleSelectionClick(result, i)"
        >
          <span *ngIf="!taItemTpl"
            ><i class="fa fa-search"></i> {{ result }}</span
          >
          <ng-template
            [ngTemplateOutlet]="taItemTpl"
            [ngTemplateOutletContext]="{
              $implicit: { result: result, index: i }
            }"
          ></ng-template>
        </button>
      </section>
    </ng-template>
  `
})
export class NgxTypeAheadComponent implements OnInit, OnDestroy {
  showSuggestions = false;
  results: string[] = [];

  @Input()
  categorias: Array<any> = [];
  @Input()
  taItemTpl!: TemplateRef<any>;
  @Input()
  taUrl = "";
  @Input()
  taParams = {};
  @Input()
  taQueryParam = "q";
  @Input()
  taCallbackParamValue;
  @Input()
  taApi = "jsonp";
  @Input()
  taApiMethod = "get";
  @Input()
  taList = [];
  @Input()
  taListItemField = [];
  @Input()
  taListItemLabel = "";
  @Input()
  taDebounce = 300;
  @Input()
  taAllowEmpty = false;
  @Input()
  taCaseSensitive = false;
  @Input()
  taDisplayOnFocus = false;

  @Output()
  taSelected = new EventEmitter<string | any>();

  // showMais: boolean = true;

  @ViewChild("suggestionsTplRef")
  suggestionsTplRef!: TemplateRef<any>;

  private suggestionIndex = 0;
  private subscriptions: Subscription[] = [];
  private activeResult = "";
  private searchQuery = "";
  private selectedItem: any = {};
  private resultsAsItems: any[] = [];
  private keydown$ = new Subject<KeyboardEvent>();
  private keyup$ = new Subject<KeyboardEvent>();
  private lastEmittedKeyboardEvent: KeyboardEvent;
  protected categoriasSelecionadas: Array<any> = [];

  constructor(
    private viewContainer: ViewContainerRef,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private roteamentoService: RoteamentoService,
    private feedService: FeedService,
    private categoriaService: CategoriaService,
    private _router: Router
  ) {}

  @HostListener("keydown", ["$event"])
  handleEsc(event: KeyboardEvent) {
    if (isEscapeKey(event)) {
      this.hideSuggestions();
      event.preventDefault();
    }
    this.keydown$.next(event);
  }

  @HostListener("keyup", ["$event"])
  onkeyup(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.keyCode !== 13) {
      this.lastEmittedKeyboardEvent = event;
    }
    this.keyup$.next(event);
  }

  @HostListener("click")
  onClick() {
    if (this.taDisplayOnFocus) {
      this.displaySuggestions();
    }
  }

  ngOnInit() {
    this.recuperarPreferencias();
    this.getPerguntasIniciais();
    this.filterEnterEvent(this.keydown$);
    this.listenAndSuggest(this.keyup$);
    this.navigateWithArrows(this.keydown$);
    this.renderTemplate();
  }

  async getPerguntasIniciais() {
    if (this.categoriasSelecionadas.length) {
      const feed = <any>(
        await this.feedService
          .getRankingComFiltros(this.categoriasSelecionadas)
          .toPromise()
      );
      this.assignResults(feed.results);
    }
  }

  recuperarPreferencias() {
    this.categoriasSelecionadas = this.categoriaService.recuperarPreferencias();
  }

  ngOnDestroy() {
    this.keydown$.complete();
    this.keyup$.complete();
  }

  renderTemplate() {
    this.viewContainer.createEmbeddedView(this.suggestionsTplRef);
    this.cdr.markForCheck();
  }

  listenAndSuggest(obs: Subject<KeyboardEvent>) {
    obs
      .pipe(
        filter((e: KeyboardEvent) => validateNonCharKeyCode(e.keyCode)),
        map(toFormControlValue),
        debounceTime(this.taDebounce),
        concat(),
        // distinctUntilChanged(),
        filter((query: string) => this.taAllowEmpty || hasCharacters(query)),
        tap((query: string) => (this.searchQuery = query)),
        switchMap((query: string) => this.suggest(query))
      )
      .subscribe((results: string[] | any) => {
        this.assignResults(results.results);
        // this.updateIndex(Key.ArrowDown);
        this.displaySuggestions();
      });
  }

  assignResults(results: any[]) {
    const labelForDisplay = this.taListItemLabel;
    this.resultsAsItems = results;
    this.results = results.map((item: string | any) =>
      labelForDisplay ? item[labelForDisplay] : item
    );
    this.suggestionIndex = NO_INDEX;
    if (!results || !results.length) {
      this.activeResult = this.searchQuery;
    }
  }

  filterEnterEvent(elementObs: Subject<KeyboardEvent>) {
    elementObs.pipe(filter(isEnterKey)).subscribe((event: KeyboardEvent) => {
      this.handleSelectSuggestionAndUpdate(this.activeResult);
    });
  }

  navigateWithArrows(elementObs: Subject<KeyboardEvent>) {
    elementObs
      .pipe(
        filter((e: any) => validateArrowKeys(e.keyCode)),
        map((e: any) => e.keyCode)
      )
      .subscribe((keyCode: number) => {
        this.updateIndex(keyCode);
        this.displaySuggestions();
      });
  }

  updateIndex(keyCode: number) {
    this.suggestionIndex = resolveNextIndex(
      this.suggestionIndex,
      keyCode === Key.ArrowDown,
      this.results.length
    );
  }

  displaySuggestions() {
    this.showSuggestions = true;
    this.cdr.markForCheck();
  }

  suggest(query: string) {
    return this.taList.length
      ? this.createListSource(this.taList, query)
      : this.request(query);
  }

  /**
   * peforms a jsonp/http request to search with query and params
   * @param query the query to search from the remote source
   */
  request(query: string) {
    const url = this.taUrl;
    const searchConfig = createParamsForQuery(
      query,
      this.taQueryParam,
      this.taParams
    );
    const options = {
      params: searchConfig
    };
    const isJsonpApi = this.taApi === "jsonp";
    return isJsonpApi
      ? this.requestJsonp(url, options, this.taCallbackParamValue)
      : this.requestHttp(url, options);
  }

  requestHttp(url: string, options) {
    const apiMethod = resolveApiMethod(this.taApiMethod);

    this.categoriasSelecionadas.forEach(categoria => {
      options.params = options.params.append("categoria", categoria);
    });

    return this.http[apiMethod](url, options);
  }

  requestJsonp(url, options, callback = "callback") {
    const params = options.params.toString();
    return this.http.jsonp(`${url}?${params}`, callback).pipe(
      map(toJsonpSingleResult),
      map(toJsonpFinalResults)
    );
  }

  markIsActive(index: number, result: string) {
    const isActive = isIndexActive(index, this.suggestionIndex);
    if (isActive) {
      this.activeResult = result;
    }
    return isActive;
  }

  handleSelectionClick(suggestion: string, index: number) {
    this.suggestionIndex = index;
    this.handleSelectSuggestion(suggestion);
  }

  navegarParaPergunta(id) {
    this.roteamentoService.navegarParaPergunta(id);
  }

  handleSelectSuggestionAndUpdate(suggestion: string) {
    const result = this.resultsAsItems.length
      ? this.resultsAsItems[this.suggestionIndex]
      : suggestion;
    this.hideSuggestions();
    const resolvedResult =
      this.suggestionIndex === NO_INDEX ? this.searchQuery : result;
    if (resolvedResult.id) {
      this.navegarParaPergunta(resolvedResult.id);
      return;
    }

    if (this._router.url.includes("searchTo")) {
      this.feedService.atualizarFeed.emit({ searchTo: resolvedResult });
      return;
    }

    this.roteamentoService.navegarFeedComTexto(resolvedResult);
  }

  handleSelectSuggestion(suggestion: string) {
    const result = this.resultsAsItems.length
      ? this.resultsAsItems[this.suggestionIndex]
      : suggestion;
    this.hideSuggestions();
    const resolvedResult =
      this.suggestionIndex === NO_INDEX ? this.searchQuery : result;
    this.taSelected.emit(resolvedResult);
    this.navegarParaPergunta(resolvedResult.id);
  }

  hideSuggestions() {
    this.showSuggestions = false;
  }

  hasItemTemplate() {
    return this.taItemTpl !== undefined;
  }

  createListSource(list: any[], query: string): Observable<string[]> {
    const sanitizedQuery = this.taCaseSensitive ? query : query.toLowerCase();
    const fieldsToExtract = this.taListItemField;
    return of(
      list.filter((item: string | any) => {
        return resolveItemValue(
          item,
          fieldsToExtract,
          this.taCaseSensitive
        ).includes(sanitizedQuery);
      })
    );
  }

  setSelecionado(categoriaSelecionada) {
    const botao = document.getElementById(categoriaSelecionada.id);
    const input = document.getElementById("searchPergunta");

    if (botao.classList.contains("tag--active")) {
      this.renderer.removeClass(botao, "tag--active");
      this.categoriasSelecionadas = remove(
        this.categoriasSelecionadas,
        categoria => {
          return categoria !== categoriaSelecionada.id;
        }
      );
    } else {
      this.renderer.addClass(botao, "tag--active");
      this.categoriasSelecionadas.push(categoriaSelecionada.id);
    }

    this.categoriaService.armazenarPreferencias(this.categoriasSelecionadas);

    setTimeout(() => {
      input.focus();
    }, 0);

    if (this.lastEmittedKeyboardEvent) {
      this.keyup$.next(this.lastEmittedKeyboardEvent);
      return;
    }

    const keyEvent = new KeyboardEvent("keydown", { code: "KeyA" });
    this.keyup$.next(keyEvent);
  }
}
