import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NegocioService extends MainService {

  public getData(): Observable<any> {
    return this._http.get(this.url_server + '/get-negocio');
  }

  public backup():Observable<Blob> {
    return this._http.get(this.url_server + "/db/full-backup", { responseType: 'blob' });
  }

  public restore(data: any): Observable<any> {
    return this._http.post(this.url_server + "/db/full-restore", data);
  }

}
