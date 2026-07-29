import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductoService } from '../../../services/producto.service';
import { lastValueFrom } from 'rxjs';
import { Producto } from '../../../models/Producto';
import { EntradaProducto } from '../../../models/EntradaProducto';
import { Usuario } from '../../../models/Usuario';

@Component({
  selector: 'app-register-entry',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-entry.html',
  styleUrl: './register-entry.css',
})
export class RegisterEntry implements OnInit {
  entradas: EntradaProducto[] = [];

  url_store: string;

  constructor(private prodServ: ProductoService) {
    this.url_store = prodServ.url_store;
  }

  async ngOnInit() {
    let us = document.getElementById('codeBar');
    if (us != null) {
      us.focus();
    }
    try {
      this.entradas = await lastValueFrom(this.prodServ.getAllEntries());
      this.entradas.sort((a, b) => {
        return new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime();
      });
      console.log(this.entradas);
      this.aplicarFiltro("Siempre");
    } catch (error: any) {
      this.prodServ.handleError(error);
    }
  }
  codigoBarras: string = '';

  async confirmarCodigo() {
    try {
      let res: Producto = await lastValueFrom(
        this.prodServ.getOne(this.codigoBarras)
      );
      this.pedirDatosProducto(res, this.prodServ.url_store + res.imagen);
    } catch (error: any) {
      if (error.status == 404)
        Swal.fire(
          'Producto no encontrado',
          'Verifica que el código sea correcto.',
          'info'
        );
      else this.prodServ.handleError(error);
    } finally {
      this.codigoBarras = '';
    }
  }

  entradasFiltradas: EntradaProducto[] = [];
  filtroFecha: string = 'Siempre';

  private startOfDay(d: Date) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private endOfDay(d: Date) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setHours(23, 59, 59, 999);
    return x;
  }

  /** Lunes a hoy (inclusive) */
  private startOfIsoWeek(d: Date) {
    const x = this.startOfDay(d);
    const dow = (x.getDay() + 6) % 7; // 0=Lun, 6=Dom
    x.setDate(x.getDate() - dow);
    return x;
  }

  aplicarFiltro(filtro: string) {
    this.filtroFecha = filtro;
    const hoy = new Date();
    const inicioHoy = this.startOfDay(hoy);
    const finHoy = this.endOfDay(hoy);

    this.entradasFiltradas = this.entradas.filter((e) => {
      // OJO: si e.fechaHora viene como string con "Z" (UTC), puede restarte horas.
      // Ajusta el parseo si fuera necesario.
      const fecha = new Date(e.fechaHora);

      if (this.filtroFecha === 'Hoy') {
        return fecha.toDateString() === hoy.toDateString();
      }
      if (this.filtroFecha === 'Ayer') {
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);
        return fecha.toDateString() === ayer.toDateString();
      }
      if (this.filtroFecha === 'Semana') {
        const inicioSemana = this.startOfIsoWeek(hoy); // Lunes actual (o lunes pasado si hoy es dom)
        const fin = finHoy; // hasta hoy
        // console.log({ inicioSemana, fin });
        return fecha >= inicioSemana && fecha <= fin;
      }
      return true; // siempre
    });
  }

  async pedirDatosProducto(producto: Producto, imagen: string) {
    const { value: formValues } = await Swal.fire({
      title: `${producto.nombre}`,
      html: `
    <img src='${imagen}' height='180px'>
    <input id="swal-cantidad" type="number" min="1" placeholder="Cantidad" class="swal2-input">
    <input id="swal-precio" type="number" step="0.01" placeholder="Precio unitario" class="swal2-input">
    <input id="swal-comment" type="text" placeholder="(Opcional) Comentario..." class="swal2-input">
  `,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      didOpen: () => {
        // 🔹 Poner foco en el input cantidad
        const inputCantidad =
          Swal.getPopup()?.querySelector<HTMLInputElement>('#swal-cantidad');
        inputCantidad?.focus();

        // 🔹 Capturar Enter para confirmar manualmente
        const modal = Swal.getPopup();
        modal?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            Swal.clickConfirm();
          }
        });
      },
      preConfirm: () => {
        const cantidad = (
          document.getElementById('swal-cantidad') as HTMLInputElement
        ).value;
        const precio = (
          document.getElementById('swal-precio') as HTMLInputElement
        ).value;
        const comment = (
          document.getElementById('swal-comment') as HTMLInputElement
        ).value;

        if (!cantidad || !precio) {
          Swal.showValidationMessage('Por favor ingresa la cantidad y precio.');
          return false;
        }

        return {
          cantidad: parseInt(cantidad),
          precio: parseFloat(precio),
          comment: comment,
        };
      },
    });

    if (formValues) {
      console.log('Cantidad:', formValues.cantidad);
      console.log('Precio unitario:', formValues.precio);
      console.log('Comentario:', formValues.comment);

      let entrada: EntradaProducto = new EntradaProducto();
      entrada.cantidad = formValues.cantidad;
      entrada.precioCompra = formValues.precio;
      entrada.observ = formValues.comment;
      entrada.producto = producto;

      let user: Usuario = new Usuario();
      let usname = localStorage.getItem('username');

      if (usname != null) user.userName = usname;

      entrada.usuario = user;
      console.log(entrada);

      try {
        let res = await lastValueFrom(this.prodServ.registrarEntrada(entrada));
        console.log(res);
        Swal.fire(
          'Registro exitoso',
          'Los datos fueron guardados correctamente',
          'success'
        );
        this.entradas.push(res);
        this.aplicarFiltro(this.filtroFecha);
      } catch (error: any) {
        this.prodServ.handleError(error);
      }
    }
  }
}
