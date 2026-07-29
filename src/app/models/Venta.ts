import { Usuario } from './Usuario';

export class Venta {
  id: any;
  folio: string = '';
  usuario: Usuario = new Usuario();
  fechaHora: Date = new Date();
  subtotal: number = 0;
  descuentoAplicado: number = 0;
  totalVenta: number = 0;
}
