import { Marca } from "./Marca";

export class Modelo {
  id: number = -1;
  nombre: string = "";
  marca: Marca = new Marca(-1, "");
  cantidad_productos: number = 0;

  constructor(id:number, nombre:string, marca: Marca) {
    this.id = id;
    this.nombre = nombre;
    this.marca = marca;
  }

}
