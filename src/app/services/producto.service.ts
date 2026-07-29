import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService extends MainService {
  public registrarEntrada(data: any): Observable<any> {
    return this._http.post(
      this.url_server + '/registrar-entrada-producto',
      data,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  public create(data: any): Observable<any> {
    return this._http.post(this.url_server + '/create-producto', data);
  }

  public getAll(): Observable<any> {
    return this._http.get(this.url_server + '/get-productos');
  }

  public getAllEntries(): Observable<any> {
    return this._http.get(this.url_server + '/get-entradas');
  }

  public getOne(qr: string): Observable<any> {
    return this._http.get(this.url_server + '/get-producto/' + qr);
  }

  public update_state(data: any): Observable<any> {
    return this._http.post(this.url_server + '/update-state', data);
  }

  public update_producto(data: any): Observable<any> {
    return this._http.post(this.url_server + '/update-producto', data);
  }

  public delete(qr: string): Observable<any> {
    return this._http.delete(this.url_server + '/delete-producto/' + qr);
  }

  public validateQR(qr: string): Observable<any> {
    return this._http.get(this.url_server + '/validate-qr/' + qr);
  }
}
