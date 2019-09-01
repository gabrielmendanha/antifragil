import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import * as socketIo from "socket.io-client";
import { TokenService } from "./token.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  baseApiUrl: string;
  private socket;

  constructor(private tokenService: TokenService) {
    this.baseApiUrl = environment.BACKEND_URL;
    this.inicializarSocket();
  }

  private inicializarSocket() {
    this.socket = socketIo(`${this.baseApiUrl}ws/notifications/`);
    this.enviarToken();
  }

  private enviarToken() {
    const token = this.tokenService.getToken();
    this.socket.emit("token", token);
  }

  public onMensagem(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on("message", data => observer.next(data));
    });
  }
}
