import { UsuarioService } from './../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { NegocioService } from '../../services/negocio.service';
import { Negocio } from '../../models/Negocio';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit, OnInit {
  public username: string;
  public password: string;

  public negocio: Negocio = new Negocio();

  constructor(
    private userServ: UsuarioService,
    private _router: Router,
    private negocioServ: NegocioService
  ) {
    this.username = '';
    this.password = '';
  }

  async ngOnInit() {
    try {
      let res = await lastValueFrom(this.negocioServ.getData());
      this.negocio = res;
      this.negocio.logo_path = this.userServ.url_store + this.negocio.logo_path;
      localStorage.setItem('negocio', JSON.stringify(this.negocio));
      console.log(res);
    } catch (error: any) {
      this.negocioServ.handleError(error);
    }
  }


  ngAfterViewInit(): void {
    let us = document.getElementById('username');
    if (us != null) {
      us.focus();
    }
  }

  async onSubmit() {
    let data = {
      username: this.username,
      password: this.password,
    };
    try {
      let res = await lastValueFrom(this.userServ.login(data));
      localStorage.setItem('rol', res.rol);
      localStorage.setItem('username', res.username);

      (window as any).electronAPI.activarRedimension();
      this._router.navigateByUrl('/dashboard/list-products');
    } catch (error: any) {
      if (error.status == 401) {
        Swal.fire(
          'Credenciales incorrectas',
          'El usuario o contraseña son invalidos',
          'info'
        );
      } else {
        this.userServ.handleError(error);
      }
    }
  }
}
