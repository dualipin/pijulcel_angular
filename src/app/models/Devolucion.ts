import { Producto } from "./Producto";
import { Usuario } from "./Usuario";
import { Venta } from "./Venta";

export class Devolucion {
  usuario: Usuario = new Usuario();
  producto: Producto = new Producto();
  venta: Venta = new Venta();
  cantidad: number = 0;
  montoReembolsado: number = 0;
  motivo: string = '';
  fechaHora: Date = new Date();
  estado: number = 1;
}
