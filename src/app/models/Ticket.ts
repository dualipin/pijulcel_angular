import { Negocio } from "./Negocio";
import { Venta } from "./Venta";

export class Ticket {
  folio: string = "";
  venta: Venta = new Venta();
  negocio: Negocio = new Negocio();
}
