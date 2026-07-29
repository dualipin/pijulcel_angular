import { NegocioService } from './../../../services/negocio.service';
import { Usuario } from './../../../models/Usuario';
import { Component, OnInit } from '@angular/core';
import { Negocio } from '../../../models/Negocio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { last, lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-negocio-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './negocio-config.html',
  styleUrl: './negocio-config.css'
})
export class NegocioConfig implements OnInit {

  negocio: Negocio = new Negocio();
  users: Usuario[] = [];

  my_username: string = "";

  constructor(private usuarioServ: UsuarioService, private negServ: NegocioService) {
    let nameUser = localStorage.getItem("username");
    if (nameUser != null)
      this.my_username = nameUser;
  }

  async ngOnInit() {
    let negocio = localStorage.getItem("negocio");
    if (negocio != null)
      this.negocio = JSON.parse(negocio);
    console.log(this.negocio);

    try {
      let res = await lastValueFrom(this.usuarioServ.getUsers());
      console.log(res);
      this.users = res;
    } catch (error: any) {
      this.usuarioServ.handleError(error);
    }

  }


  selectedFile: File | null = null;
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  isLoading_upload: boolean = false;

  async restore() {
    this.isLoading_upload = true;
    try {
      if (!this.selectedFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      await lastValueFrom(this.negServ.restore(formData));

      Swal.fire({
        title: 'Éxito',
        text: 'La restauración se realizó correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });


    } catch (error: any) {
      this.usuarioServ.handleError(error);
    } finally {
      this.isLoading_upload = false;
      this.selectedFile = null; // Limpiar el archivo seleccionado después de la restauración
    }
  }

  isLoading: boolean = false;

  async backup() {
    this.isLoading = true;
    try {
      const blob = await lastValueFrom(this.negServ.backup());
      console.log(blob);
      const reader = new FileReader();
      reader.onloadend = () => {
        const buffer = reader.result as ArrayBuffer;
        (window as any).electronAPI.saveBackup(buffer);
      };
      reader.readAsArrayBuffer(blob);


    } catch (error: any) {
      this.usuarioServ.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  createUser() {

    Swal.fire({
      title: 'Crear nuevo usuario',
      html: `
    <input id="swal-input-username" class="swal2-input" placeholder="Username">
    <input id="swal-input-password" class="swal2-input" type="password" placeholder="Contraseña">
    <select id="swal-input-role" class="swal2-select">
      <option value="1">Admin</option>
      <option value="0">Cajero</option>
    </select>
  `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const username = (document.getElementById('swal-input-username') as HTMLInputElement).value;
        const password = (document.getElementById('swal-input-password') as HTMLInputElement).value;
        const role = (document.getElementById('swal-input-role') as HTMLSelectElement).value;

        if (!username || !password) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return;
        }

        // Validación de username duplicado (accede a la variable global `users`)
        const exists = this.users.some(u => u.userName.toLowerCase() === username.toLowerCase());
        if (exists) {
          Swal.showValidationMessage('El username ya existe');
          return;
        }

        return { username, password, role };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const nuevoUsuario = new Usuario();
        nuevoUsuario.userName = result.value.username;
        nuevoUsuario.password = result.value.password;
        nuevoUsuario.rol = result.value.role;
        nuevoUsuario.activo = true;

        try {
          let res = await lastValueFrom(this.usuarioServ.createUser(nuevoUsuario));
          this.users.push(nuevoUsuario);
          console.log('Usuario creado:', res);
        } catch (error: any) {
          this.usuarioServ.handleError(error);
        }
      }
    });

  }

  async deleteUser(user: Usuario) {
    Swal.fire({
      title: "¿Estás seguro de eliminar este usuario?",
      text: "Si eliminas este usuario ya no podrás recuperarlo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Si, eliminar!"
    }).then(async (result) => {
      if (result.isConfirmed) {

        try {
          let res = await lastValueFrom(this.usuarioServ.deleteUser(user.userName));
          console.log(res);
          this.users = this.users.filter(u => u.userName.toLowerCase() !== user.userName.toLowerCase());
        } catch (error: any) {
          this.usuarioServ.handleError(error);
        }

      }
    });
  }

  editarNegocio() {

  }

}
