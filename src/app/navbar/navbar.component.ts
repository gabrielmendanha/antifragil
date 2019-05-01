import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewChild,
  AfterContentChecked,
  ElementRef
} from "@angular/core";
// import { ɵa } from "ngx-typeahead";
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent
  implements OnInit, AfterContentChecked, AfterViewChecked {
  public url = "http://suggestqueries.google.com/complete/search";
  public params = {
    hl: "en",
    ds: "yt",
    xhr: "t",
    client: "youtube"
  };
  public search = "";
  opened: boolean = false;
  // @ViewChild("suggestionsMenuTplRef") suggestionsMenuTplRef: ElementRef;

  constructor() {}

  ngOnInit() {}

  ngAfterContentChecked() {}

  ngAfterViewChecked() {
    // const aux = this.suggestionsMenuTplRef;
    // ɵa.prototype.onClick = function() {
    //   this.suggestionsTplRef.elementRef.nativeElement.innerHTML = aux;
    //   this.showSuggestions = true;
    //   this.results = [""];
    // };
  }

  handleResultSelected(result) {
    this.search = result;
  }

  onKeydown() {
    this.opened = true;
  }
}
