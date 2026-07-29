import { Producto } from "./Producto";
import { Venta } from "./Venta";

export class DetalleVenta {
  id: any;            // Integer en Java → number en TS
  venta: Venta = new Venta();          // Relación ManyToOne con Venta
  producto: Producto = new Producto();  // Relación ManyToOne con Producto
  cantidad: number = 0;      // int → number
  devueltos: number = 0;     // int → number
  precioUnit: number = 0;    // double → number
  descuentoUnit: number = 0;    // opcional, default 0.0 en Java
  total: number = 0;      // double → number
}
