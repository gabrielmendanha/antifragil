import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class FeedService {
  baseApiUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = environment.BACKEND_URL;
  }

  getRanking() {
    return this.httpClient
      .get(`${this.baseApiUrl}autoria/ranking/ranking_data/`)
      .pipe(
        catchError(error => {
          return Observable.throw(error);
        })
      );
  }
}
