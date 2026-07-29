import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends MainService {

  public createUser(data:any): Observable<any> {
    return this._http.post(this.url_server+"/create-user", data);
  }

  public deleteUser(username: string): Observable<any> {
    return this._http.delete(this.url_server+"/delete-user/" + username);
  }

  public getUsers(): Observable<any> {
    return this._http.get(this.url_server+"/get-users");
  }

}
