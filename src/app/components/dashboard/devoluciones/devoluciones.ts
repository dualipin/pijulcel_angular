import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DetalleVenta } from '../../../models/DetalleVenta';
import { Venta } from '../../../models/Venta';
import { VentaService } from '../../../services/ventas.service';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Devolucion } from '../../../models/Devolucion';
import { Usuario } from '../../../models/Usuario';
import { Negocio } from '../../../models/Negocio';

interface VentaDTO {
  venta: Venta;
  detalles: DetalleVenta[];
}

@Component({
  selector: 'app-devoluciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './devoluciones.html',
  styleUrl: './devoluciones.css',
})
export class Devoluciones implements OnInit {
  folioTicket: string = '';
  venta: VentaDTO = { venta: new Venta(), detalles: [] };
  url_store: string = '';
  negocio: Negocio = new Negocio();

  constructor(private ventaServ: VentaService) {
    this.url_store = this.ventaServ.url_store;
    const neg = localStorage.getItem('negocio');
    if (neg) this.negocio = JSON.parse(neg);
  }

  async ngOnInit() {
    let us = document.getElementById('codeBar');
    if (us != null) {
      us.focus();
    }
  }

  private buffer = '';

  @HostListener('document:keydown', ['$event'])
  handleScannerInput(event: KeyboardEvent): void {
    const activeElement = document.activeElement;

    // Ignorar si el usuario está escribiendo en un input o textarea
    if (
      activeElement &&
      ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)
    ) {
      return;
    }

    if (event.key === 'Enter') {
      const scannedCode = this.buffer.trim();
      this.buffer = ''; // limpiar para el siguiente escaneo

      if (scannedCode.length > 6) {
        console.log('Código escaneado:', scannedCode);
        this.folioTicket = scannedCode;
        this.confirmarCodigo();
      }
      return;
    }

    // Solo acumular caracteres imprimibles (evita Ctrl, Shift, etc.)
    if (event.key.length === 1) {
      this.buffer += event.key;
    }
  }

  async confirmarCodigo() {
    console.log('Folio de la venta:', this.folioTicket);
    try {
      this.venta = await lastValueFrom(
        this.ventaServ.getVentaByFolio(this.folioTicket)
      );
      console.log('Venta encontrada:', this.venta);
    } catch (error: any) {
      if (error.status === 404) {
        Swal.fire(
          'Folio no encontrado',
          'No se encontró una venta con ese folio.',
          'warning'
        );
      } else {
        this.ventaServ.handleError(error);
      }
    } finally {
      this.folioTicket = '';
    }
  }

  confirmarDevolucion(detalle: DetalleVenta) {
    Swal.fire({
      title: '¿Por qué deseas devolver este producto?',
      icon: 'info',
      input: 'select',
      inputOptions: {
        Defectuoso: 'Producto defectuoso',
        Incompatible: 'Modelo incompatible',
      },
      inputPlaceholder: 'Selecciona el motivo de la devolución',
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar un motivo antes de continuar';
        }
        return null;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const motivo = result.value;

        Swal.fire({
          title: 'Cantidad a devolver',
          input: 'number',
          inputAttributes: {
            min: '1',
            max: (detalle.cantidad - detalle.devueltos).toString(),
            step: '1',
          },
          inputValue: '1',
          inputValidator: (value) => {
            if (!value || parseInt(value) < 1) {
              return 'La cantidad debe ser al menos 1';
            }
            if (parseInt(value) > detalle.cantidad - detalle.devueltos) {
              return `No puedes devolver más de ${
                detalle.cantidad - detalle.devueltos
              } unidades.`;
            }
            return null;
          },
          showCancelButton: true,
          confirmButtonText: 'Confirmar devolución',
        }).then(async (cantidadResult) => {
          if (cantidadResult.isConfirmed) {
            try {
              let user = new Usuario();
              user.userName = localStorage.getItem('username') || '';

              let devolucion = new Devolucion();
              devolucion.usuario = user;
              devolucion.producto = detalle.producto;
              devolucion.venta = this.venta.venta;
              devolucion.montoReembolsado = parseFloat(
                (
                  (detalle.precioUnit - detalle.descuentoUnit) *
                  parseInt(cantidadResult.value)
                ).toFixed(2)
              );
              devolucion.cantidad = parseInt(cantidadResult.value);
              devolucion.motivo = motivo;

              console.log('Devolución a registrar:', devolucion);
              detalle.devueltos += devolucion.cantidad;

              interface DevolucionDTO {
                devolucion: Devolucion;
                idDetalle: number;
                devueltos: number;
              }

              const devolucionDTO: DevolucionDTO = {
                devolucion: devolucion,
                idDetalle: detalle.id,
                devueltos: detalle.devueltos,
              };

              await lastValueFrom(
                this.ventaServ.devolverProducto(devolucionDTO)
              );

              Swal.fire(
                'Devolución confirmada',
                `Se devolvieron ${devolucion.cantidad} de ${detalle.producto.nombre} (Motivo: ${devolucion.motivo}).`,
                'success'
              );
              let fecha = new Date(devolucion.fechaHora).toLocaleString(
                'es-MX',
                {
                  timeZone: 'America/Mexico_City',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                }
              );

              const html = `
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
                    <th>Motivo</th>
                    <th>Total</th>
                  </tr>
                  </thead>
                  <tbody>
                      <tr>
                        <td style="text-align: left; word-break: break-word; white-space: normal;">${
                          detalle.producto.nombre
                        }</td>
                        <td style="text-align: center;">${
                          devolucion.cantidad
                        }</td>
                        <td style="text-align: center; font-size: 11px; padding: 4px;">${
                          devolucion.motivo
                        }</td>
                        <td style="text-align: center;">$${devolucion.montoReembolsado.toLocaleString(
                          'es-MX',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}</td>
                      </tr>
                  </tbody>
                </table>
                <br/>
                <p>¡Ticket de devolución!</p>
                <p style="margin-top: 10px;">
                  Fecha: ${fecha}
                </p>
                <hr/>
                </div>
              </body>
              </html>
              `;
              await (window as any).electronAPI.imprimirVariosTickets([html]);
            } catch (error) {
              this.ventaServ.handleError(error);
            }
          }
        });
      }
    });
  }
}
