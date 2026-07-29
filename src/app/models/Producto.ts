import { Categoria } from "./Categoria";
import { Marca } from "./Marca";
import { Modelo } from "./Modelo";

export class Producto {
    codigoQr: string = "";
    imagen: string = "";
    nombre: string = "";
    marca: Marca = new Marca(0, "");
    modelo: Modelo = new Modelo(0, "", this.marca);
    categoria: Categoria = new Categoria(0, "");
    precioVenta: number = 0;
    precioCosto: number = 0;
    precioNegocio: number = 0;
    stock: number = 0;
    stockMinimo: number = 0;
    estado: number = 1;

    oferta:any = null;
    nuevoPrecio:any = null;
}
