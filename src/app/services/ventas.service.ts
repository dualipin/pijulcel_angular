import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VentaService extends MainService {
  public finalizarVenta(data: any): Observable<any> {
    return this._http.post(this.url_server + '/registrar-venta', data, {
      headers: { "Content-Type": "application/json" }
    });
  }

  public devolverProducto(devolucion: any): Observable<any> {
    return this._http.post(this.url_server + '/registrar-devolucion', devolucion, {
      headers: { "Content-Type": "application/json" }
    });
  }

  public getVentaByFolio(folio: string): Observable<any> {
    return this._http.get(this.url_server + '/venta-by-folio/' + folio);
  }

  public getAllVentas(): Observable<any> {
    return this._http.get(this.url_server + '/ventas');
  }
}
