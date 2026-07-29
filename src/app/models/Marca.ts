export class Marca {
    id: number = -1;
    nombre: string = "";
    cantidad_productos: number = 0;
    constructor(id?: number, nombre?: string) {
        this.id = id ?? -1;
        this.nombre = nombre ?? "";
    }
}
