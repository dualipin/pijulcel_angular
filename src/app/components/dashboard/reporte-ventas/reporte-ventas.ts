import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Negocio } from '../../../models/Negocio';
import { VentaService } from '../../../services/ventas.service';
import { Venta } from '../../../models/Venta';
import { DetalleVenta } from '../../../models/DetalleVenta';

interface DTO_venta {
  venta: Venta;
  detalles: DetalleVenta[];
}

@Component({
  selector: 'app-reporte-ventas',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-ventas.html',
  styleUrl: './reporte-ventas.css',
})
export class ReporteVentas implements OnInit {
  ventas: DTO_venta[] = [];
  ventasFiltradas: DTO_venta[] = [];

  negocio: Negocio = new Negocio();

  constructor(private ventaServ: VentaService) {
    const neg = localStorage.getItem('negocio');
    if (neg) this.negocio = JSON.parse(neg);
  }

  async ngOnInit() {
    try {
      this.ventas = await lastValueFrom(this.ventaServ.getAllVentas());
      // Ordenar de más reciente a más antigua:
      let newData = [];
      for (let i = this.ventas.length; i > 0; i--) {
        newData.push(this.ventas[i - 1]);
      }
      this.ventas = newData;
      this.aplicarFiltro('Hoy');
      this.calcularResumen();
      console.log('Ventas obtenidas:', this.ventas);
    } catch (error: any) {
      this.ventaServ.handleError(error);
    }
  }

  resumenVentas = {
    dia: 0,
    semana: 0,
    mes: 0,
  };
  rangoResumen: string = '';

  calcularResumen() {
    const hoy = new Date();
    const inicioSemana = this.getInicioSemana(hoy);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.resumenVentas = {
      dia: 0,
      semana: 0,
      mes: 0,
    };

    for (const dto of this.ventas) {
      const fecha = new Date(dto.venta.fechaHora);
      const total = dto.venta.totalVenta;

      if (this.esMismoDia(fecha, hoy)) {
        this.resumenVentas.dia += total;
      }
      if (fecha >= inicioSemana && fecha <= hoy) {
        this.resumenVentas.semana += total;
      }
      if (fecha >= inicioMes && fecha <= hoy) {
        this.resumenVentas.mes += total;
      }
    }

    this.rangoResumen = `Del ${formatDate(
      inicioMes,
      'd',
      'es-MX'
    )} al ${formatDate(hoy, "d 'de' MMMM", 'es-MX')}`;
  }

  esMismoDia(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  getInicioSemana(fecha: Date): Date {
    const diaSemana = fecha.getDay(); // 0 = domingo
    const inicio = new Date(fecha);
    inicio.setDate(fecha.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1)); // lunes como inicio
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }

  async reimprimirTicket(venta: DTO_venta) {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ticket de Venta</title>
        <style>
          @page {
            margin: 0;          /* quita márgenes del navegador */
            size: auto;         /* deja que la impresora decida tamaño */
          }
        body {
          margin: 0;          /* quita márgenes de body */
          display: flex;
          justify-content: left;
          padding-left: 15px;
          font-family: Arial, sans-serif;
        }
        .container {
          width: 265px;
          font-size: 14px;
          text-align: center;
        }
        h1, h2, h3 {
          margin: 5px 0;
        }
        .logo {
          width: 80px;
          height: auto;
          margin-bottom: 5px;
        }
        .info {
          font-size: 12px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        th, td {
          text-align: left;
          padding: 2px 0;
        }
        th {
          border-bottom: 1px dashed #000;
          text-align: center;
        }
        tfoot td {
          border-top: 1px dashed #000;
          font-weight: bold;
        }
          svg {
           margin-top: 10px;
          margin-bottom: 4px;
          }
        .td-origin {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 5px;
          flex-direction: column;
          text-align: center;
          font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
        <img class="logo" src="${this.negocio.logo_path}" alt="Logo">
        <h2>${this.negocio.nombre}</h2>
        <p class="info">
          ${this.negocio.direccion}<br>
          Tel: ${this.negocio.telefono}<br>
        </p>
        <table>
          <thead>
          <tr>
            <th>Producto</th>
            <th>Cant</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
          </thead>
          <tbody>
      `;

    // Agregar productos del carrito al HTML
    for (const item of venta.detalles) {
      const nombre = item.producto.nombre;

      htmlContent += `
          <tr>
            <td style="font-size: 11px; word-break: break-word; white-space: normal;">${nombre}</td>
            <td><div class="td-origin">${item.cantidad}</div></td>
            `;

      htmlContent += `<td><div class="td-origin">`;

      let precioUnitDesc = item.precioUnit - item.descuentoUnit;
      if (precioUnitDesc <= 0) {
        precioUnitDesc = 0.0;
      }

      if (item.descuentoUnit > 0) {
        htmlContent += `
              <label style="text-decoration: line-through; margin-bottom: 0px; font-size: 10px;">
                $${item.precioUnit.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </label>
              $${precioUnitDesc.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</div></td>
              `;
      } else {
        htmlContent += `
              $${item.precioUnit.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</div></td>
              `;
      }

      htmlContent += `
            <td><div class="td-origin">$${item.total.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</div></td>
          </tr>
          `;
    }

    let fecha = new Date(venta.venta.fechaHora).toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    htmlContent += `
          </tbody>
          <tfoot>
          <tr>
            <td colspan="3">Total</td>
            <td>$${venta.venta.totalVenta.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</td>
          </tr>
          </tfoot>
        </table>
        <br/>
        <hr/>
        <!-- Contenedor del código de barras -->
        <svg id="barcode"></svg>
        <p> Folio: ${venta.venta.folio} </p>
        <p style="margin-top: 10px;">
          Fecha: ${fecha}
        </p>
        <p>¡Reimpresión de ticket!</p>
        <hr/>
        <div style="border-top: 1px dashed black; border-bottom: 1px dashed black; padding: 6px 0; font-size: 12px; text-align: center;">
          <p class="mb-1 fw-bold">--- POLÍTICAS DE GARANTÍA ---</p>
          <ul style="list-style: none; padding-left: 0; margin: 0; text-align: left; font-size: 11px; line-height: 1.3;">
            <li>✔ Indispensable presentar ticket.</li>
            <li>✔ Las pantallas / touch deben venir sin sello quitado o roto.</li>
            <li>✔ Sin haber sido pegada o traer residuos de pegamento.</li>
            <li>✔ Sin flex roto o conector dañado.</li>
            <li>✔ Que no esté quebrada la pieza.</li>
            <li>✔ Favor de revisar bien las piezas antes de retirarse.</li>
          </ul>
        </div>
        <hr/>
        </div>



        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          const codigo = "${venta.venta.folio}"; // tu número con guion
          JsBarcode("#barcode", codigo, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.5,
            height: 50,      // altura un poco mayor para mejor visibilidad
            displayValue: false,
            fontSize: 12,
            margin: 0
          });
        </script>
      </body>
      </html>
        `;

    try {
      await (window as any).electronAPI.imprimirVariosTickets([htmlContent]);
    } catch (error: any) {
      this.ventaServ.handleError(error);
    }
  }
  filtroFecha: string = 'Hoy';

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

    this.ventasFiltradas = this.ventas.filter((e) => {
      // OJO: si e.fechaHora viene como string con "Z" (UTC), puede restarte horas.
      // Ajusta el parseo si fuera necesario.
      const fecha = new Date(e.venta.fechaHora);

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
