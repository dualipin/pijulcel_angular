import Swal from 'sweetalert2';
import { MainService } from './main.service';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExceptionService {
  public url_server: string;
  public url_store: string;
  /**
   * La función constructora inicializa el HttpClient y establece los valores de URL y token.
   * @param {HttpClient} _http - El parámetro `_http` es de tipo `HttpClient`,
   * que es un servicio proporcionado por Angular para realizar peticiones HTTP a un servidor. Permite
   * enviar peticiones GET, POST, PUT, DELETE, etc. a un servidor backend y manejar las respuestas.
   */
  constructor(public _http: HttpClient) {
    this.url_server = 'http://localhost:8081/api/v1';
    this.url_store = this.url_server + '/media/';
  }

  public testAPI(): Observable<any> {
    const response = this._http.get(this.url_server + '/test', {
      mode: 'no-cors',
    });
    console.log('Test API response:', response);
    return response;
  }

  /**
   * Maneja los errores de las peticiones HTTP.
   * @param {any} error - El error capturado por el interceptor.
   * Este método maneja errores comunes como el 503 (Servicio no disponible) y el 0 (Sin conexión).
   */
  handleError(error: any): void {
    console.log('La petición respondio con [' + error.status + ']', error);
    // ERROR 503: Servicio no disponible
    // ERROR 0: Sin conexión
    if (error.status == 503 || error.status == 0) this.reintentarConexion();
  }

  reintentarConexion() {
    Swal.fire({
      title: '¡Sin conexión al servidor!',
      text: 'Por favor, verifica que el servidor esté en ejecución.',
      icon: 'error',
      showConfirmButton: true,
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lastValueFrom(this.testAPI());
          Swal.fire({
            title: 'Conexión exitosa',
            text: 'Se ha establecido conexión con el servidor.',
            icon: 'success',
          });
        } catch (error: any) {
          this.handleError(error);
        }
      }
    });
  }
}
