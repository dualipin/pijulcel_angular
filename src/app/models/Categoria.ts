export class Categoria {
    id: number = -1;
    nombre: string = "";
    cantidad_productos: number = 0;

    constructor(id: number = 0, nombre: string = "") {
        this.id = id;
        this.nombre = nombre;
    }
}
