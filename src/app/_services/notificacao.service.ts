import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class NotificacaoService {
  private enviarNotificacao: Subject<any> = new Subject<any>();

  constructor() {}

  getNotificacaoSubject(): Subject<any> {
    return this.enviarNotificacao;
  }

  enviar(notificacao) {
    this.enviarNotificacao.next(notificacao);
  }
}
