import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ExceptionService } from './exception.service';

@Injectable({
  providedIn: 'root'
})
export class MainService extends ExceptionService {

  public login(data: any): Observable<any> {
    return this._http.post(this.url_server + '/login', data);
  }

}
