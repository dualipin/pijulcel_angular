import { Categoria } from "./Categoria";
import { DescuentoConfig } from "./DescuentoConfig";

export class DescuentoCategoria {
  id: any;
  categoria: Categoria = new Categoria();
  config: DescuentoConfig = new DescuentoConfig();
}
