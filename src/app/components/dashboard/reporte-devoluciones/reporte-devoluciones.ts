import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Devolucion } from '../../../models/Devolucion';
import { DevolucionService } from '../../../services/devolucion.service';
import { ProductoService } from '../../../services/producto.service';
import { lastValueFrom } from 'rxjs';
import { Producto } from '../../../models/Producto';

@Component({
  selector: 'app-reporte-devoluciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-devoluciones.html',
  styleUrl: './reporte-devoluciones.css',
})
export class ReporteDevoluciones implements OnInit {
  devoluciones: Devolucion[] = [];

  constructor(private devolucionServ: DevolucionService, private prodServ: ProductoService) {}

  ngOnInit(): void {
    this.devolucionServ.getDevoluciones().subscribe((data) => {
      this.devoluciones = data;
      this.devoluciones.sort((a, b) => {
        return (
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );
      });
      this.aplicarFiltro("Siempre");
    });
  }

  async reabastecer(dev: Devolucion) {
    try {
      dev.producto.stock += dev.cantidad;
      await lastValueFrom(this.devolucionServ.reabastecerProducto(dev));
      dev.estado = 2; // Cambiar estado a reabastecido
      // Actualizar la lista de devoluciones después de reabastecer
      console.log("Producto reabastecido:", dev);
    } catch (error: any) {
      this.devolucionServ.handleError(error);
    }
  }

  devFiltradas: Devolucion[] = [];
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

    this.devFiltradas = this.devoluciones.filter((e) => {
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
}
