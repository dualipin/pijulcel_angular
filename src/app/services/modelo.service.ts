import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModeloService extends MainService {

  public createModelo(data: any): Observable<any> {
    return this._http.post(this.url_server + '/create-modelo', data);
  }

  public getModelosByMarca(id: string): Observable<any> {
    return this._http.get(this.url_server + '/get-modelo-by-marca/'+ id);
  }

  public countModelosById(id: string): Observable<any> {
    return this._http.get(this.url_server + '/count-modelos/' + id);
  }

  public getModelos(): Observable<any> {
    return this._http.get(this.url_server + '/get-all-modelos');
  }

  public deleteModelo(id: string): Observable<any> {
    return this._http.delete(this.url_server + '/delete-modelo/' + id);
  }

}
