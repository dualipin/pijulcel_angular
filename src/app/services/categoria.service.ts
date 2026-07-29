import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService extends MainService {

  public create(data: any): Observable<any> {
    return this._http.post(this.url_server + '/create-categoria', data);
  }

  public getAll(): Observable<any> {
    return this._http.get(this.url_server + '/get-categorias');
  }

  public countCategorias(id:string): Observable<any> {
    return this._http.get(this.url_server + '/count-categorias/'+id);
  }

  public deleteCategoria(id: string): Observable<any> {
    return this._http.delete(this.url_server + '/delete-categoria/' + id);
  }

}
