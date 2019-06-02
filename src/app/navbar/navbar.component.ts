import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewChild,
  AfterContentChecked,
  ElementRef
} from "@angular/core";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent implements OnInit {
  public url = "http://suggestqueries.google.com/complete/search";
  public params = {
    hl: "en",
    ds: "yt",
    xhr: "t",
    client: "youtube"
  };
  public search = "";
  opened: boolean = false;

  constructor() {}

  ngOnInit() {}

  handleResultSelected(result) {
    this.search = result;
  }

  onKeydown() {
    this.opened = true;
  }
}
