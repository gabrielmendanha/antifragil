import { Injectable } from "@angular/core";
import { BehaviorSubject, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class DominioService {
  private categorias: BehaviorSubject<Array<any>>;
  baseApiUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = environment.BACKEND_URL;
  }

  setCategorias(user: any) {
    if (!this.categorias) {
      this.categorias = new BehaviorSubject<any>(user);
    } else {
      this.categorias.next(user);
    }
  }

  async verificarCategorias() {
    if (this.categorias) {
      return this.getCategoriasSubject();
    }
    const response = <any>await this.httpClient
      .get(`${this.baseApiUrl}autoria/categoria/`)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      )
      .toPromise();
    this.setCategorias(response.results);
  }

  getCategoriasSubject(): BehaviorSubject<any> {
    return this.categorias;
  }

  async getCategorias() {
    await this.verificarCategorias();
    return this.getCategoriasSubject().value;
  }
}
