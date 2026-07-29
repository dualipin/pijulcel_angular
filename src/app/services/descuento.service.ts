import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DescuentoService extends MainService {
  public createDescProducto(data: any): Observable<any> {
    return this._http.post(this.url_server + '/descuento-producto', data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  public createDescCateg(data: any): Observable<any> {
    return this._http.post(this.url_server + '/descuento-categoria', data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  public createDescMarca(data: any): Observable<any> {
    return this._http.post(this.url_server + '/descuento-marca', data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  public getAll(): Observable<any> {
    return this._http.get(this.url_server + "/get-all-descuentos");
  }

  public deleteDescuento(id: string): Observable<any> {
    return this._http.delete(this.url_server + "/delete-descuento/" + id);
  }

}
