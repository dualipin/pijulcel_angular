import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import JsBarcode from 'jsbarcode';
import { Producto } from '../../../models/Producto';
import Swal from 'sweetalert2';
import { Marca } from '../../../models/Marca';
import { MarcaService } from '../../../services/marca.service';
import { lastValueFrom } from 'rxjs';
import { ModeloService } from '../../../services/modelo.service';
import { Modelo } from '../../../models/Modelo';
import { Categoria } from '../../../models/Categoria';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoService } from '../../../services/producto.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule],
  templateUrl: './register-product.html',
  styleUrl: './register-product.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class RegisterProduct implements OnInit {

  productoForm: FormGroup;
  producto: Producto = new Producto();
  listMarcas: Marca[] = [];
  listModelos: Modelo[] = [];
  listCateg: Categoria[] = [];

  constructor(private fb: FormBuilder, private marcaServ: MarcaService, private modeloServ: ModeloService,
    private categServ: CategoriaService, private productoServ: ProductoService, private route: ActivatedRoute) {
    this.productoForm = this.fb.group({
      codigoQr: [{ value: null, disabled: true }, Validators.required],
      imagen: [null, Validators.required],
      nombre: [null, Validators.required],
      marca_id: ["", Validators.required],
      modelo_id: ["", Validators.required],
      categ_id: ["", Validators.required],
      precioVenta: [null, Validators.required, Validators.min(0)],
      precioCosto: [0, Validators.min(0)],
      precioNegocio: [0, Validators.min(0)],
      stock: [null, Validators.required, Validators.min(1)],
      stockMinimo: [null, Validators.required, Validators.min(1)],
    });
    this.previewUrl = this.productoServ.url_store;
  }

  async updateProduct() {
    this.isLoadSave = true;
    let formData = new FormData();

    formData.append("qr", this.producto.codigoQr);

    if (this.producto.imagen !== this.productoForm.get('imagen')?.value)
      formData.append("file", this.productoForm.get('imagen')?.value);

    if (this.producto.nombre !== this.productoForm.get('nombre')?.value)
      formData.append("nombre", this.productoForm.get('nombre')?.value);
    else
      formData.append("nombre", "");

    if ((this.producto.marca.id).toString() !== (this.productoForm.get('marca_id')?.value).toString())
      formData.append("marca_id", this.productoForm.get('marca_id')?.value);
    else
      formData.append("marca_id", "-1");

    if ((this.producto.modelo.id).toString() !== (this.productoForm.get('modelo_id')?.value).toString())
      formData.append("modelo_id", this.productoForm.get('modelo_id')?.value);
    else
      formData.append("modelo_id", "-1");

    if ((this.producto.categoria.id).toString() !== (this.productoForm.get('categ_id')?.value).toString())
      formData.append("categ_id", this.productoForm.get('categ_id')?.value);
    else
      formData.append("categ_id", "-1");

    if (this.producto.precioVenta !== this.productoForm.get('precioVenta')?.value)
      formData.append("precio", this.productoForm.get('precioVenta')?.value);
    else
      formData.append("precio", "-1");

    if (this.producto.precioCosto !== this.productoForm.get('precioCosto')?.value)
      formData.append("precio_costo", this.productoForm.get('precioCosto')?.value);
    else
      formData.append("precio_costo", "-1");

    if (this.producto.precioNegocio !== this.productoForm.get('precioNegocio')?.value)
      formData.append("precio_negocio", this.productoForm.get('precioNegocio')?.value);
    else
      formData.append("precio_negocio", "-1");

    if (this.producto.stock !== this.productoForm.get('stock')?.value)
      formData.append("stock", this.productoForm.get('stock')?.value);
    else
      formData.append("stock", "-1");

    if (this.producto.stockMinimo !== this.productoForm.get('stockMinimo')?.value)
      formData.append("stock_min", this.productoForm.get('stockMinimo')?.value);
    else
      formData.append("stock_min", "-1");

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      let res = await lastValueFrom(this.productoServ.update_producto(formData));
      console.log(res);
      Swal.fire('Producto actualizado!', `El producto se actualizó correctamente.`, 'success');
      this.isEdith = false;
      this.productoForm.reset();
      this.previewUrl = null;
      this.selectedMarca = false;
      this.listModelos = [];
      this.productoForm.controls['marca_id'].setValue("");
      this.productoForm.controls['modelo_id'].setValue("");
      this.productoForm.controls['categ_id'].setValue("");
      this.generarCodigo();
    } catch (error: any) {
      this.productoServ.handleError(error);
    } finally {
      this.isLoadSave = false;
    }
  }

  async restartChangeUpdate() {

    this.listModelos = await lastValueFrom(this.modeloServ.getModelosByMarca((this.producto.marca.id).toString()));

    this.productoForm.controls['codigoQr'].setValue(this.producto.codigoQr);
    this.productoForm.controls['imagen'].setValue(this.producto.imagen);
    this.productoForm.controls['nombre'].setValue(this.producto.nombre);
    this.productoForm.controls['marca_id'].setValue(this.producto.marca.id);
    this.productoForm.controls['modelo_id'].setValue(this.producto.modelo.id);
    this.productoForm.controls['categ_id'].setValue(this.producto.categoria.id);
    this.productoForm.controls['precioVenta'].setValue(this.producto.precioVenta);
    this.productoForm.controls['precioCosto'].setValue(this.producto.precioCosto);
    this.productoForm.controls['precioNegocio'].setValue(this.producto.precioNegocio);
    this.productoForm.controls['stock'].setValue(this.producto.stock);
    this.productoForm.controls['stockMinimo'].setValue(this.producto.stockMinimo);

    this.previewUrl = this.categServ.url_store + this.producto.imagen;
    this.selectedMarca = true;

  }

  changeDetected(): Boolean {
    if (this.producto.codigoQr !== this.productoForm.get('codigoQr')?.value)
      return true;

    if (this.producto.imagen !== this.productoForm.get('imagen')?.value)
      return true;

    if (this.producto.nombre !== this.productoForm.get('nombre')?.value)
      return true;

    if ((this.producto.marca.id).toString() !== (this.productoForm.get('marca_id')?.value).toString())
      return true;

    if ((this.producto.modelo.id).toString() !== (this.productoForm.get('modelo_id')?.value).toString())
      return true;

    if ((this.producto.categoria.id).toString() !== (this.productoForm.get('categ_id')?.value).toString())
      return true;

    if (this.producto.precioVenta !== this.productoForm.get('precioVenta')?.value)
      return true;

    if (this.producto.precioCosto !== this.productoForm.get('precioCosto')?.value)
      return true;

    if (this.producto.precioNegocio !== this.productoForm.get('precioNegocio')?.value)
      return true;

    if (this.producto.stock !== this.productoForm.get('stock')?.value)
      return true;

    if (this.producto.stockMinimo !== this.productoForm.get('stockMinimo')?.value)
      return true;

    return false;
  }

  async initEdithProducto() {
    if (this.isEdith) {
      this.listModelos = await lastValueFrom(this.modeloServ.getModelosByMarca((this.producto.marca.id).toString()));

      this.productoForm.controls['codigoQr'].setValue(this.producto.codigoQr);
      this.productoForm.controls['imagen'].setValue(this.producto.imagen);
      this.productoForm.controls['nombre'].setValue(this.producto.nombre);
      this.productoForm.controls['marca_id'].setValue(this.producto.marca.id);
      this.productoForm.controls['modelo_id'].setValue(this.producto.modelo.id);
      this.productoForm.controls['categ_id'].setValue(this.producto.categoria.id);
      this.productoForm.controls['precioVenta'].setValue(this.producto.precioVenta);
      this.productoForm.controls['precioCosto'].setValue(this.producto.precioCosto);
      this.productoForm.controls['precioNegocio'].setValue(this.producto.precioNegocio);
      this.productoForm.controls['stock'].setValue(this.producto.stock);
      this.productoForm.controls['stockMinimo'].setValue(this.producto.stockMinimo);

      this.previewUrl += this.producto.imagen;
      this.selectedMarca = true;

      this.selectCateg();

      JsBarcode('#barcode', this.producto.codigoQr, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 40,
        displayValue: true
      });
    }
  }

  isEdith: Boolean = false;

  async ngOnInit() {

    try {
      this.listCateg = await lastValueFrom(this.categServ.getAll());
      this.listMarcas = await lastValueFrom(this.marcaServ.getMarcas());

      this.route.queryParams.subscribe(params => {
        const data = params['data'];
        if (data) {
          this.producto = JSON.parse(data);
          this.isEdith = true;
          this.initEdithProducto();
        } else {
          this.isEdith = false;
          this.productoForm.reset();
          this.previewUrl = null;
          this.selectedMarca = false;
          this.listModelos = [];
          this.productoForm.controls['marca_id'].setValue("");
          this.productoForm.controls['modelo_id'].setValue("");
          this.productoForm.controls['categ_id'].setValue("");
          this.generarCodigo();
        }
      });

    } catch (error: any) {
      this.productoServ.handleError(error);
    }
  }



  async generarCodigo() {
    let barcode = Math.floor(Date.now() / 1000);
    try {
      let res = await lastValueFrom(this.productoServ.validateQR(barcode.toString()));
      if (res == true) {
        Swal.fire('Código de barra ya existe', 'No te preocupes, generaré un nuevo código.', 'info');
        this.generarCodigo();
        return;
      }
    } catch (error: any) {
      if (error.status == 404) {
        JsBarcode('#barcode', barcode.toString(), {
          format: 'CODE128',
          lineColor: '#000',
          width: 2,
          height: 40,
          displayValue: true
        });
        this.productoForm.controls['codigoQr'].setValue(barcode.toString());
      } else {
        this.productoServ.handleError(error);
      }
    }

  }

  getNameCateg(id: string): string {
    for (const element of this.listCateg) {
      if (element.id.toString() === id.toString()) {
        return element.nombre;
      }
    }
    return "";
  }

  previewUrl: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.productoForm.controls['imagen'].setValue(file);
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  newMarca() {
    Swal.fire({
      title: "Crea una nueva marca",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
        placeholder: "Ej. Samsung, Apple, Xiaomi..."
      },
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Crear marca",
      showLoaderOnConfirm: true,
      preConfirm: async (marca) => {

        if (!marca) {
          Swal.showValidationMessage('Por favor, ingresa un nombre de marca válido.');
          return;
        }

        let duplicate = false;

        this.listMarcas.forEach(element => {
          console.log(element);
          if (element.nombre.toLowerCase() === marca.toLowerCase()) {
            duplicate = true;
            Swal.showValidationMessage(`La marca "${marca}" ya existe.`);
            return;
          }
        });

        if (duplicate)
          return;


        try {
          let res = await lastValueFrom(this.marcaServ.createMarca({ nombre: marca }));
          this.listMarcas.push(new Marca(res.id, res.nombre));
          Swal.fire('¡Creada!', `La marca "${marca}" fue registrada.`, 'success');
        } catch (error: any) {
          this.categServ.handleError(error);
        }

      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Marca creada:', result.value);
      }
    });
  }

  async selectMarca() {
    const marca_id = this.productoForm.get('marca_id')?.value;
    this.selectedMarca = true;

    try {
      let res = await lastValueFrom(this.modeloServ.getModelosByMarca(marca_id));
      this.listModelos = res;
      console.log('Modelos obtenidos:', this.listModelos);
      this.productoForm.controls['modelo_id'].setValue(""); // Reset modelo_id when
    } catch (error: any) {
      this.marcaServ.handleError(error);
    }
    console.log('Marca seleccionada', marca_id);
  }

  async newModelo() {
    Swal.fire({
      title: 'Selecciona un modelo',
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
        placeholder: "Ej. G20, X98..."
      },
      confirmButtonText: 'Crear',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: async (modelo) => {

        if (!modelo) {
          Swal.showValidationMessage('Por favor, ingresa un nombre de marca válido.');
          return;
        }

        let duplicate = false;

        this.listModelos.forEach(element => {
          console.log(element);
          if (element.nombre.toLowerCase() === modelo.toLowerCase()) {
            duplicate = true;
            Swal.showValidationMessage(`El modelo "${modelo}" ya existe.`);
            return;
          }
        });

        if (duplicate)
          return;

        try {
          let data = {
            "nombre": modelo,
            "marca": {
              "id": this.productoForm.get('marca_id')?.value
            }
          }
          let res = await lastValueFrom(this.modeloServ.createModelo(data));
          console.log('Modelo creado:', res);
          this.listModelos.push(new Modelo(res.id, res.nombre, new Marca(res.marca.id, res.marca.nombre)));
          Swal.fire('¡Creado!', `El modelo "${modelo}" fue registrado.`, 'success');
          this.productoForm.controls['modelo_id'].setValue(res.id);
        } catch (error: any) {
          this.categServ.handleError(error);
        }

      }
    });
  }

  selectedMarca: boolean = false;

  selectModelo() {
    const modelo_id = this.productoForm.get('modelo_id')?.value;
    console.log('Modelo seleccionado', modelo_id);
  }

  selectCateg() {
    const categ_id = this.productoForm.get('categ_id')?.value;
    console.log('Categoría seleccionada', categ_id);
  }


  newCateg() {
    Swal.fire({
      title: 'Nueva categoría',
      input: 'text',
      inputPlaceholder: 'Ej. Displays, Baterías, Fundas...',
      confirmButtonText: 'Crear',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor, ingresa un nombre válido.';
        }
        if (value.length > 50) {
          return 'El nombre no debe exceder los 50 caracteres.';
        }
        return null;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const nuevaCategoria = result.value;

        let duplicate = false;
        this.listCateg.forEach(element => {
          if (element.nombre.toLowerCase() === nuevaCategoria.toLowerCase()) {
            duplicate = true;
            Swal.showValidationMessage(`La categoría "${nuevaCategoria}" ya existe.`);
            return;
          }
        });
        if (duplicate) return;

        try {
          let res = await lastValueFrom(this.categServ.create({ nombre: nuevaCategoria }));
          console.log('Categoría creada:', res);
          this.listCateg.push(new Categoria(res.id, res.nombre));
          this.productoForm.controls['categ_id'].setValue(res.id);
          console.log('Categoría creada:', nuevaCategoria);
          Swal.fire('¡Creada!', `La categoría "${nuevaCategoria}" fue agregada.`, 'success');
        } catch (error: any) {
          this.categServ.handleError(error);
        }

      }
    });

  }

  isLoadSave: Boolean = false;

  async onSubmit() {

    this.isLoadSave = true;

    const formData = new FormData();
    formData.append('qr', this.productoForm.get('codigoQr')?.value);
    formData.append('nombre', this.productoForm.get('nombre')?.value);
    formData.append('marca_id', this.productoForm.get('marca_id')?.value);
    formData.append('modelo_id', this.productoForm.get('modelo_id')?.value);
    formData.append('categ_id', this.productoForm.get('categ_id')?.value);
    formData.append('precio', this.productoForm.get('precioVenta')?.value);
    formData.append('precio_costo', this.productoForm.get('precioCosto')?.value);
    formData.append('precio_negocio', this.productoForm.get('precioNegocio')?.value);
    formData.append('stock', this.productoForm.get('stock')?.value);
    formData.append('stock_min', this.productoForm.get('stockMinimo')?.value);
    formData.append('file', this.productoForm.get('imagen')?.value);

    try {
      let res = await lastValueFrom(this.productoServ.create(formData));
      console.log('Producto registrado:', res);
      Swal.fire('¡Registrado!', 'El producto ha sido registrado exitosamente.', 'success');

      this.generarCodigo();
      this.productoForm.reset();
      this.previewUrl = null;
      this.selectedMarca = false;
      this.listModelos = [];
      this.productoForm.controls['marca_id'].setValue("");
      this.productoForm.controls['modelo_id'].setValue("");
      this.productoForm.controls['categ_id'].setValue("");


    } catch (error: any) {
      this.productoServ.handleError(error);
    } finally {
      this.isLoadSave = false;
    }
  }

}
