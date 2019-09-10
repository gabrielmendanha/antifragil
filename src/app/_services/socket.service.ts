import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { TokenService } from "./token.service";
import { Observable, Subject, Observer } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  baseApiUrl: string;
  private socket: any;

  constructor(private tokenService: TokenService) {
    this.baseApiUrl = environment.WEBSOCKET_URL;
    this.socket = <Subject<any>>this.abrirConexaoSocket();
  }

  private abrirConexaoSocket(): Subject<MessageEvent> {
    let socket = new WebSocket(`${this.baseApiUrl}ws/notifications/`);

    let observable = Observable.create((obs: Observer<MessageEvent>) => {
      socket.onmessage = obs.next.bind(obs);
      socket.onerror = obs.error.bind(obs);
      socket.onclose = obs.complete.bind(obs);
      return socket.close.bind(socket);
    });

    let observer = {
      next: (data: string) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data);
        }
      }
    };

    socket.onopen = () => {
      this.enviarToken();
    };

    return Subject.create(observer, observable);
  }

  public enviarToken() {
    const token = this.tokenService.getToken();
    this.socket.next(`{"token": "${token}"}`);
  }

  public enviar(mensagem) {
    this.socket.next(JSON.stringify(mensagem));
  }

  public onMensagem(): Observable<any> {
    return this.socket.pipe(
      map(mensagem => {
        return this.handleMensagem(mensagem);
      })
    );
  }

  private handleMensagem(mensagem) {
    const data = JSON.parse(mensagem.data);
    return data;
  }
}
