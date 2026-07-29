import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../../services/categoria.service';
import { ModeloService } from '../../../services/modelo.service';
import { Categoria } from '../../../models/Categoria';
import { Marca } from '../../../models/Marca';
import { lastValueFrom } from 'rxjs';
import { MarcaService } from '../../../services/marca.service';
import { Modelo } from '../../../models/Modelo';
import Swal from 'sweetalert2';

interface Marca_Modelo {
  marcas: Marca;
  modelos: Modelo[];
}

@Component({
  selector: 'app-categ-marcas',
  imports: [CommonModule],
  templateUrl: './categ-marcas.html',
  styleUrl: './categ-marcas.css'
})
export class CategMarcas implements OnInit {

  public categorias: Categoria[] = [];
  public marcas: Marca[] = [];
  public marcasModelos: Marca_Modelo[] = [];

  constructor(private categServ: CategoriaService, private marcaServ: MarcaService, private modServ: ModeloService) { }

  async ngOnInit() {
    this.categorias = [];
    this.marcas = [];
    this.marcasModelos = [];
    try {
      this.categorias = await lastValueFrom(this.categServ.getAll());

      for (const categoria of this.categorias) {
        const count = await lastValueFrom(this.categServ.countCategorias((categoria.id).toString()));
        categoria.cantidad_productos = count;
      }

      // Ordenar de mayor a menor por cantidad_productos
      this.categorias.sort((a, b) => (b.cantidad_productos ?? 0) - (a.cantidad_productos ?? 0));


      this.marcas = await lastValueFrom(this.marcaServ.getMarcas());

      for (const marca of this.marcas) {
        // Obtener la cantidad de productos por marca
        const count = await lastValueFrom(this.marcaServ.countMarcas((marca.id).toString()));
        marca.cantidad_productos = count;

        // Obtener los modelos por marca
        const modelos = await lastValueFrom(this.modServ.getModelosByMarca((marca.id).toString()));

        for (const modelo of modelos) {
          modelo.cantidad_productos = await lastValueFrom(this.modServ.countModelosById((modelo.id).toString()));
        }

        this.marcasModelos.push({ marcas: marca, modelos: modelos });
      }

      this.marcasModelos.sort((a, b) => (b.marcas.cantidad_productos ?? 0) - (a.marcas.cantidad_productos ?? 0));
      for (const marcaModelo of this.marcasModelos) {
        marcaModelo.modelos.sort((a, b) => (b.cantidad_productos ?? 0) - (a.cantidad_productos ?? 0));
      }
      console.log(this.marcasModelos);

    } catch (error: any) {
      this.categServ.handleError(error);
    }
  }

  async removerModelo(modelo: Modelo) {
    Swal.fire({
      title: 'Eliminar Modelo',
      text: `¿Estás seguro de que deseas eliminar el modelo ${modelo.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lastValueFrom(this.modServ.deleteModelo(modelo.id.toString()));
          for (const marcaModelo of this.marcasModelos) {
            const index = marcaModelo.modelos.findIndex(m => m.id === modelo.id);
            if (index !== -1) {
              marcaModelo.modelos.splice(index, 1);
              break;
            }
          }
        } catch (error: any) {
          this.modServ.handleError(error);
        }
      }
    });

  }

  async deleteMarca(marca: Marca) {
    Swal.fire({
      title: 'Eliminar Marca',
      text: `¿Estás seguro de que deseas eliminar la marca ${marca.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lastValueFrom(this.marcaServ.deleteMarca((marca.id).toString()));
          this.marcasModelos = this.marcasModelos.filter(m => m.marcas.id.toString() !== (marca.id).toString());
        } catch (error: any) {
          this.marcaServ.handleError(error);
        }
      }
    });
  }

  async removerCategoria(categoria: Categoria) {
    Swal.fire({
      title: 'Eliminar Categoría',
      text: `¿Estás seguro de que deseas eliminar la categoría ${categoria.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lastValueFrom(this.categServ.deleteCategoria((categoria.id).toString()));
          this.categorias = this.categorias.filter(c => c.id.toString() !== (categoria.id).toString());
        } catch (error: any) {
          this.categServ.handleError(error);
        }
      }
    });
  }

}
