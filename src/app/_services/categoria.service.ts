import { Injectable } from "@angular/core";
import { TokenService } from "./token.service";

@Injectable({
  providedIn: "root"
})
export class CategoriaService {
  constructor(private tokenService: TokenService) {}

  armazenarPreferencias(preferencias: Array<number>) {
    const token = this.tokenService.getToken();
    localStorage.setItem(`${token}:preferencias`, JSON.stringify(preferencias));
  }

  recuperarPreferencias() {
    const token = this.tokenService.getToken();
    return JSON.parse(localStorage.getItem(`${token}:preferencias`)) || [];
  }
}
