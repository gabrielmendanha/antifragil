import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class FeedService {
  baseApiUrl: string;
  private page_size = "10";

  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = environment.BACKEND_URL;
  }

  getRankingComFiltros(categorias: any, filtro = "data-criacao", search = "") {
    let params = new HttpParams();

    params = params.append("ordem", filtro);
    params = params.append("page_size", this.page_size);
    params = params.append("titulo", search);
    categorias.forEach(categoria => {
      params = params.append("categoria", categoria);
    });

    return this.httpClient
      .get(`${this.baseApiUrl}autoria/pergunta/`, { params: params })
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  getRanking(filtro = "data-criacao") {
    let params = new HttpParams();

    params = params.append("ordem", filtro);
    params = params.append("page_size", this.page_size);

    return this.httpClient
      .get(`${this.baseApiUrl}autoria/perguntas/`, { params: params })
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  getRankingPage(url) {
    return this.httpClient.get(url).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getPerguntaDetalhe(id) {
    return this.httpClient
      .get(`${this.baseApiUrl}autoria/perguntas/${id}/`)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  criarPergunta(data) {
    return this.httpClient
      .post(`${this.baseApiUrl}autoria/perguntas/`, data)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  criarResposta(perguntaId, data) {
    return this.httpClient
      .post(`${this.baseApiUrl}autoria/perguntas/${perguntaId}/resposta/`, data)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  apagarPergunta(perguntaId) {
    return this.httpClient
      .delete(`${this.baseApiUrl}autoria/perguntas/${perguntaId}/`)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  apagarComentario(perguntaId, comentarioId) {
    return this.httpClient
      .delete(
        `${
          this.baseApiUrl
        }autoria/perguntas/${perguntaId}/resposta/${comentarioId}/`
      )
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }
}
