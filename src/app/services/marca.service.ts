import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarcaService extends MainService {


  public createMarca(data: any): Observable<any> {
    return this._http.post(this.url_server + '/create-marca', data);
  }

  public getMarcas(): Observable<any> {
    return this._http.get(this.url_server + '/get-marcas');
  }

  public countMarcas(id: string): Observable<any> {
    return this._http.get(this.url_server + '/count-marcas/' + id);
  }

  public deleteMarca(id: string): Observable<any> {
    return this._http.delete(this.url_server + '/delete-marca/' + id);
  }

}
