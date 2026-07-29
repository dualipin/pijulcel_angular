import { DescuentoConfig } from "./DescuentoConfig";
import { Marca } from "./Marca";

export class DescuentoMarca {
  id: any
  marca: Marca = new Marca();
  config: DescuentoConfig = new DescuentoConfig();
}
