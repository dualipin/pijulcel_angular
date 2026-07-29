import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DevolucionService extends MainService {

  public getDevoluciones(): Observable<any> {
    return this._http.get(this.url_server + '/devoluciones');
  }

  public reabastecerProducto(producto: any): Observable<any> {
    return this._http.post(this.url_server + '/reabastecer', producto, {
      headers: { "Content-Type": "application/json" }
    });
  }

}
