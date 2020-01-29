import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { catchError, map } from "rxjs/operators";
import { throwError } from "rxjs";
import sortBy from "lodash/sortBy";

@Injectable({
  providedIn: "root"
})
export class PerguntaService {
  baseApiUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseApiUrl = environment.BACKEND_URL;
  }

  curtirPergunta(perguntaId) {
    return this.httpClient
      .put(`${this.baseApiUrl}autoria/perguntas/${perguntaId}/curtir/`, {})
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  descurtirPergunta(perguntaId) {
    return this.httpClient
      .put(`${this.baseApiUrl}autoria/perguntas/${perguntaId}/descurtir/`, {})
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  curtirResposta(perguntaId, respostaId) {
    return this.httpClient
      .put(
        `${this.baseApiUrl}autoria/perguntas/${perguntaId}/resposta/${respostaId}/curtir/`,
        {}
      )
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  descurtirResposta(perguntaId, respostaId) {
    return this.httpClient
      .put(
        `${this.baseApiUrl}autoria/perguntas/${perguntaId}/resposta/${respostaId}/descurtir/`,
        {}
      )
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  denunciarResposta(perguntaId, respostaId) {
    return this.httpClient
      .put(
        `${this.baseApiUrl}autoria/perguntas/${perguntaId}/resposta/${respostaId}/denunciar/`,
        {}
      )
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  denunciar(perguntaId) {
    return this.httpClient
      .put(`${this.baseApiUrl}autoria/perguntas/${perguntaId}/denunciar/`, {})
      .pipe(
        map((pergunta: any) => {
          const comentarios = sortBy(
            pergunta.comentarios,
            "quantidade_curtidas"
          ).reverse();
          pergunta.comentarios = comentarios;
          return pergunta;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }
}
