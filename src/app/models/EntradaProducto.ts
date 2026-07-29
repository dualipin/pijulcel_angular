import { Producto } from "./Producto";
import { Usuario } from "./Usuario";

export class EntradaProducto {
  id:any;
  usuario: Usuario = new Usuario();
  producto: Producto = new Producto();
  cantidad: number = -1;
  precioCompra: number = -1;
  fechaHora: any;
  observ:string = "";
}
