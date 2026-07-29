import { ProductoService } from './../../../services/producto.service';
import { CategoriaService } from './../../../services/categoria.service';
import { MarcaService } from './../../../services/marca.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Marca } from '../../../models/Marca';
import { Categoria } from '../../../models/Categoria';
import { Producto } from '../../../models/Producto';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { DescuentoService } from '../../../services/descuento.service';
import { DescuentoProducto } from '../../../models/DescuentoProducto';
import { DescuentoConfig } from '../../../models/DescuentoConfig';
import { DescuentoCategoria } from '../../../models/DescuentoCategoria';
import { DescuentoMarca } from '../../../models/DescuentoMarca';

@Component({
  selector: 'app-descuentos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './descuentos.html',
  styleUrl: './descuentos.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class Descuentos implements OnInit {

  filtrarBy: number = 0;

  formDescuento: FormGroup;

  listDesProd: DescuentoProducto[] = [];
  listDesMarc: DescuentoMarca[] = [];
  listDesCateg: DescuentoCategoria[] = [];

  marcas: Marca[] = [];
  productos: Producto[] = [];
  categorias: Categoria[] = [];

  hoy: string;
  url_store: string;

  constructor(private fb: FormBuilder, private marcaServ: MarcaService, private categServ: CategoriaService,
    private productoServ: ProductoService, private descServ: DescuentoService
  ) {
    this.url_store = productoServ.url_store;
    const fecha = new Date();
    this.hoy = fecha.toLocaleDateString('en-CA');
    this.formDescuento = this.fb.group({
      tipoDescuento: [null, Validators.required],
      valor: [null, [Validators.required, Validators.max(100), Validators.min(1)]],
      tipoAplicacion: [null, Validators.required],

      validarQR: [null, Validators.required],

      publicNow: ['true', Validators.required],
      IsIndefinided: ['true', Validators.required],

      marca_id: [null, Validators.required],
      categoria_id: [null, Validators.required],
      producto_id: [null, Validators.required],

      fechaInicio: [this.hoy],
      fechaFinal: [this.hoy, Validators.required]
    });
  }

  cambiarTipoApp() {
    let tipo = this.formDescuento.get("tipoAplicacion")?.value;
    if (tipo.toString() === "1") {
      this.formDescuento.controls['validarQR'].setValue(null);
      this.formDescuento.controls['producto_id'].setValue(null);
      this.formDescuento.controls['categoria_id'].setValue("null");
      this.formDescuento.controls['marca_id'].setValue("null");

    } else if (tipo.toString() === "2") {
      this.formDescuento.controls['validarQR'].setValue("false");
      this.formDescuento.controls['producto_id'].setValue("null");
      this.formDescuento.controls['categoria_id'].setValue(null);
      this.formDescuento.controls['marca_id'].setValue("null");

    } else if (tipo.toString() === "3") {
      this.formDescuento.controls['validarQR'].setValue("false");
      this.formDescuento.controls['producto_id'].setValue("null");
      this.formDescuento.controls['categoria_id'].setValue("null");
      this.formDescuento.controls['marca_id'].setValue(null);
    }

  }
  async ngOnInit() {
    try {
      this.productos = await lastValueFrom(this.productoServ.getAll());
      this.categorias = await lastValueFrom(this.categServ.getAll());
      this.marcas = await lastValueFrom(this.marcaServ.getMarcas());

      let res = await lastValueFrom(this.descServ.getAll());

      this.listDesProd = res.ByProductos;
      this.listDesCateg = res.ByCategorias;
      this.listDesMarc = res.ByMarcas;

      console.log(this.listDesProd, this.listDesCateg, this.listDesMarc);

    } catch (error: any) {
      this.productoServ.handleError(error);
    }
  }

  isSubmit: Boolean = false;
  isDelete: Boolean = false;

  async deleteDescuento(item: string, tipo: number) {
    this.isDelete = true;
    try {
      let res = await lastValueFrom(this.descServ.deleteDescuento(item));
      console.log(res);

      if (tipo == 1)
        this.listDesProd = this.listDesProd.filter(p => p.config.id !== item);
      else if (tipo == 2)
        this.listDesCateg = this.listDesCateg.filter(p => p.config.id !== item);
      else if (tipo == 3)
        this.listDesMarc = this.listDesMarc.filter(p => p.config.id !== item);

      Swal.fire('¡Descuento eliminado!', 'El descuento se elimino correctamente.', 'success');

    } catch (error: any) {
      this.productoServ.handleError(error);
    } finally {
      this.isDelete = false;
    }
  }

  producto: Producto = new Producto();

  valiateQR() {
    if ((this.formDescuento.get("producto_id")?.value).toString() !== this.producto.codigoQr) {
      this.formDescuento.controls['validarQR'].setValue(null);
    } else {
      this.formDescuento.controls['validarQR'].setValue("true");
    }
  }

  async confirmProducto() {
    try {
      this.producto = await lastValueFrom(this.productoServ.getOne(this.formDescuento.get("producto_id")?.value));

      const imagen = `${this.url_store + this.producto.imagen}`;
      const nombre = this.producto.nombre;

      Swal.fire({
        title: "¡Producto encontrado!",
        text: nombre,
        imageUrl: imagen,
        imageHeight: 400,
        imageAlt: "Imagen de producto"
      });
      this.formDescuento.controls['validarQR'].setValue("true");
    } catch (error: any) {

      this.formDescuento.controls['validarQR'].setValue(null);

      if (error.status == 404)
        Swal.fire('Producto no encontrado', 'Verifica el Código de barra.', 'info');
      else
        this.productoServ.handleError(error);
    }
  }

  config: DescuentoConfig = new DescuentoConfig();
  discProducto: DescuentoProducto = new DescuentoProducto();
  discCategoria: DescuentoCategoria = new DescuentoCategoria();
  discMarca: DescuentoMarca = new DescuentoMarca();

  async onSubmit() {
    this.isSubmit = true;

    this.config.valor = this.formDescuento.get("valor")?.value;
    this.config.tipoDescuento = this.formDescuento.get("tipoDescuento")?.value;
    this.config.tipoAplicacion = this.formDescuento.get("tipoAplicacion")?.value;

    if ((this.formDescuento.get("publicNow")?.value).toString() === 'true'){
      this.config.fechaInicio = this.hoy;
      this.config.estado = "Activo";
    } else {
      this.config.fechaInicio = this.formDescuento.get("fechaInicio")?.value;
      if(new Date(this.config.fechaInicio) > new Date()){
        this.config.estado = "Programado";
      }
      else this.config.estado = "Activo";
    }


    if ((this.formDescuento.get("IsIndefinided")?.value).toString() === 'true')
      this.config.fechaFin = null;
    else
      this.config.fechaFin = this.formDescuento.get("fechaFinal")?.value;

    try {

      if ((this.formDescuento.get("tipoAplicacion")?.value).toString() === "1") {
        this.discProducto.producto.codigoQr = this.formDescuento.get("producto_id")?.value;
        this.discProducto.config = this.config;
        console.log(this.discProducto);

        let exist = false;

        for (let index = 0; index < this.listDesProd.length; index++) {
          const element = this.listDesProd[index];
          if (element.producto.codigoQr === this.discProducto.producto.codigoQr) {
            Swal.fire('¡Descuendo duplicado!', 'Este producto ya tiene un descuento, si necesitas modificarlo, elimina el descuento anterior y crea otro.', 'info');
            exist = true;
          }
        }

        if(!exist){
          let res = await lastValueFrom(this.descServ.createDescProducto(this.discProducto));
          console.log(res);
        } else return;

      } else if ((this.formDescuento.get("tipoAplicacion")?.value).toString() === "2") {
        this.discCategoria.categoria.id = this.formDescuento.get("categoria_id")?.value;
        this.discCategoria.config = this.config;


        let exist = false;

        for (let index = 0; index < this.listDesCateg.length; index++) {
          const element = this.listDesCateg[index];
          console.log(element.categoria.id, this.discCategoria.categoria.id);
          if ((element.categoria.id).toString() === (this.discCategoria.categoria.id).toString()) {
            Swal.fire('¡Descuendo duplicado!', 'Esta categoría ya tiene un descuento, si necesitas modificarlo elimina el descuento anterior y crea otro.', 'info');
            exist = true;
          }
        }

        if(!exist){
          let res = await lastValueFrom(this.descServ.createDescCateg(this.discCategoria));
          console.log(res);
        } else return;

      } else if ((this.formDescuento.get("tipoAplicacion")?.value).toString() === "3") {
        this.discMarca.marca.id = this.formDescuento.get("marca_id")?.value;
        this.discMarca.config = this.config;


        let exist = false;

        for (let index = 0; index < this.listDesMarc.length; index++) {
          const element = this.listDesMarc[index];
          if (element.marca.id === this.discMarca.marca.id) {
            Swal.fire('¡Descuendo duplicado!', 'Esta marca ya tiene un descuento, si necesitas modificarlo elimina el descuento anterior y crea otro.', 'info');
            exist = true;
          }
        }

        if(!exist){
          let res = await lastValueFrom(this.descServ.createDescMarca(this.discMarca));
          console.log(res);
        } else return;
      }
      Swal.fire('¡Descuento registrado!', 'El descuento se registro correctamente.', 'success');
      this.formDescuento.reset();
      this.formDescuento.controls["publicNow"].setValue('true');
      this.formDescuento.controls["IsIndefinided"].setValue('true');
      this.formDescuento.controls["fechaInicio"].setValue(this.hoy);
      this.formDescuento.controls["fechaFinal"].setValue(this.hoy);

      let res = await lastValueFrom(this.descServ.getAll());

      this.listDesProd = res.ByProductos;
      this.listDesCateg = res.ByCategorias;
      this.listDesMarc = res.ByMarcas;


    } catch (error: any) {
      this.productoServ.handleError(error);
    } finally {
      this.isSubmit = false;
    }
  }
}
