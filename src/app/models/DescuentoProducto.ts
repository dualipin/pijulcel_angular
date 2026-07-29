import { Producto } from './Producto';
import { DescuentoConfig } from "./DescuentoConfig";

export class DescuentoProducto {
  id:any;
  producto: Producto = new Producto();
  config: DescuentoConfig = new DescuentoConfig();
}
