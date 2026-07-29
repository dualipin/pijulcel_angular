// Angular imports
import { Router } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// RxJS imports
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

// Models
import { Producto } from '../../../models/Producto';
import { Categoria } from '../../../models/Categoria';
import { DescuentoProducto } from '../../../models/DescuentoProducto';
import { DescuentoCategoria } from '../../../models/DescuentoCategoria';
import { DescuentoMarca } from '../../../models/DescuentoMarca';

// Services
import { ProductoService } from '../../../services/producto.service';
import { VisibilityService } from '../../../services/visibility.service';
import { CategoriaService } from '../../../services/categoria.service';
import { DescuentoService } from '../../../services/descuento.service';
import { Negocio } from '../../../models/Negocio';
import { Venta } from '../../../models/Venta';
import { Usuario } from '../../../models/Usuario';
import { Ticket } from '../../../models/Ticket';
import { DetalleVenta } from '../../../models/DetalleVenta';
import { VentaService } from '../../../services/ventas.service';
import { Marca } from '../../../models/Marca';
import { MarcaService } from '../../../services/marca.service';

interface Carrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-list-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-products.html',
  styleUrl: './list-products.css',
})
export class ListProducts implements OnInit {
  public productos: Producto[] = [];
  public vista: Producto[] = [];
  public carrito: Carrito[] = [];

  public listDescCateg: DescuentoCategoria[] = [];
  public listDescMarca: DescuentoMarca[] = [];
  public listDescProd: DescuentoProducto[] = [];
  public categories: Categoria[] = [];
  public marcas: Marca[] = [];

  public url_store: string = '';
  public isAdmin: Boolean = false;
  public showNav: Boolean = true;
  public negocio: Negocio = new Negocio();
  public user: Usuario = new Usuario();

  /**
   * Constructor for ListProducts component
   * @param productoServ
   * @param visibilityService
   * @param categServ
   * @param _router
   * @param descServ
   */
  constructor(
    private productoServ: ProductoService,
    private visibilityService: VisibilityService,
    private categServ: CategoriaService,
    private _router: Router,
    private descServ: DescuentoService,
    private ventaServ: VentaService,
    private marcaServ: MarcaService
  ) {
    let username = localStorage.getItem('username');
    if (username !== null) this.user.userName = username;

    if (localStorage.getItem('rol') !== null)
      localStorage.getItem('rol') === '1'
        ? (this.isAdmin = true)
        : (this.isAdmin = false);

    if (!this.isAdmin) visibilityService.hide();

    this.url_store = this.productoServ.url_store;
  }

  /**
   * Initialize the component
   */
  async ngOnInit() {
    let negocio = localStorage.getItem('negocio');
    if (negocio != null) this.negocio = JSON.parse(negocio);

    try {
      this.marcas = await lastValueFrom(this.marcaServ.getMarcas());
      console.log(this.marcas);
      // Fetch all products
      this.productos = await lastValueFrom(this.productoServ.getAll());
      // Fetch all categories
      let categ = await lastValueFrom(this.categServ.getAll());

      // Filtra los productos que estan desabilitados si no es admin
      if (!this.isAdmin)
        this.productos = this.productos.filter(
          (producto) => producto.estado == 1
        );

      // Set the categories
      this.categories = categ;
      // Set the view to all products
      this.vista = this.productos;

      // Set the visibility of the navigation bar
      this.visibilityService.showElement$.subscribe((value) => {
        this.showNav = value;
      });

      // Fetch all discounts
      let res = await lastValueFrom(this.descServ.getAll());

      // Filter discounts by categories, brands, and products
      this.filterDescuento(this.listDescCateg, res.ByCategorias, 0);
      this.filterDescuento(this.listDescMarca, res.ByMarcas, 1);
      this.filterDescuento(this.listDescProd, res.ByProductos, 2);

      // Log the results for debugging
      console.log(this.listDescCateg, this.listDescMarca, this.listDescProd);
    } catch (error: any) {
      this.productoServ.handleError(error);
    }
  }

  private filterDescuento(listDesc: any[], res: any[], type: number) {
    if (res && res.length > 0) {
      // Filter out expired and scheduled discounts
      listDesc = res;
      listDesc = listDesc.filter(
        (m) => m.config.estado !== 'Vencido' && m.config.estado !== 'Programado'
      );

      // Apply discounts to products based on the type of discount
      // 0: Category, 1: Brand, 2: Product
      for (let i = 0; i < listDesc.length; i++) {
        const element = listDesc[i];

        // Iterate through all products to apply the discount
        for (let f = 0; f < this.productos.length; f++) {
          // Get the current product
          const producto = this.productos[f];

          let isInList = false;
          // Check if the product is in the list based on the type of discount
          // 0: Category, 1: Brand, 2: Product
          if (type === 0)
            isInList = element.categoria.id === producto.categoria.id;
          else if (type === 1)
            isInList = element.marca.id === producto.marca.id;
          else if (type === 2)
            isInList = element.producto.codigoQr === producto.codigoQr;

          // If the product is not in the list, continue to the next product
          if (!isInList) continue;

          // If the product is in the list, apply the discount
          producto.oferta = null;
          producto.oferta = '-' + element.config.valor;

          // Set the new price based on the type of discount
          // 1: Percentage, 2: Fixed amount
          if (element.config.tipoDescuento == 1) {
            producto.oferta += '%';
            producto.nuevoPrecio =
              producto.precioVenta -
              producto.precioVenta * (element.config.valor * 0.01);
          } else if (element.config.tipoDescuento == 2) {
            producto.oferta += ' MXN';
            producto.nuevoPrecio = producto.precioVenta - element.config.valor;
          }
        }
      }
    }
  }

  selectMarca(marca:Marca) {
    this.vista = this.productos.filter(
      (producto) => producto.marca.id === marca.id
    );
  }

  private buffer = '';

  @HostListener('document:keydown', ['$event'])
  handleScannerInput(event: KeyboardEvent): void {
    const activeElement = document.activeElement;

    // Ignorar si el usuario está escribiendo en un input o textarea
    if (
      activeElement &&
      ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)
    ) {
      return;
    }

    if (event.key === 'Enter') {
      const scannedCode = this.buffer.trim();
      this.buffer = ''; // limpiar para el siguiente escaneo

      if (scannedCode.length > 6) {
        console.log('Código escaneado:', scannedCode);
        const producto = this.productos.find((p) => p.codigoQr === scannedCode);
        if (producto) {
          this.vista = [producto];
        } else {
          Swal.fire(
            'No encontrado',
            'No se encontró un producto con ese código QR.',
            'warning'
          );
        }
      }
      return;
    }

    // Solo acumular caracteres imprimibles (evita Ctrl, Shift, etc.)
    if (event.key.length === 1) {
      this.buffer += event.key;
    }
  }

  editarProducto(prod: Producto) {
    this._router.navigate(['/dashboard/register-product'], {
      queryParams: { data: JSON.stringify(prod) },
    });
  }

  searchByQR() {
    Swal.fire({
      title: 'Buscar por Código de barra',
      input: 'text',
      inputLabel: 'Ingrese el código QR del producto',
      inputPlaceholder: 'Código QR',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const codigoQr = result.value.trim();
        const producto = this.productos.find((p) => p.codigoQr === codigoQr);
        if (producto) {
          this.vista = [producto];
        } else {
          Swal.fire(
            'No encontrado',
            'No se encontró un producto con ese código QR.',
            'warning'
          );
        }
      }
    });
  }

  activeCategory = 'Todo';

  setActiveCategory(category: string) {
    this.activeCategory = category;
    if (category === 'Todo') {
      this.vista = this.productos;
    } else {
      this.vista = this.productos.filter(
        (producto) => producto.categoria.nombre === category
      );
    }
  }

  async updateState(product: Producto, state: number) {
    let formData = new FormData();
    formData.append('qr', product.codigoQr);
    formData.append('estado', state.toString());
    try {
      let res = await lastValueFrom(this.productoServ.update_state(formData));
      console.log(res);
      product.estado = state;
    } catch (error: any) {
      this.productoServ.handleError(error);
    }
  }

  addToCart(producto: Producto) {
    const existingItem = this.carrito.find(
      (item) => item.producto.codigoQr === producto.codigoQr
    );
    if (existingItem) {
      if (producto.stock <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Cantidad máxima alcanzada',
          text: `No puedes agregar más de ${producto.stock} unidades de este producto al carrito.`,
        });
        return;
      }
      existingItem.cantidad++;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
    producto.stock--;
  }

  removeFromCart(item: Carrito) {
    const index = this.carrito.indexOf(item);
    if (index > -1) {
      this.carrito.splice(index, 1);
      let value = this.productos.findIndex(
        (p) => p.codigoQr === item.producto.codigoQr
      );
      if (value !== -1) {
        this.productos[value].stock += item.cantidad;
      }
    }
  }

  deleteProducto(qr: string) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este producto?',
      text: 'Si eliminas este producto todas las ventas, descuentos, tickets y entradas se eliminaran para siempre.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, eliminar!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let res = await lastValueFrom(this.productoServ.delete(qr));
          console.log(res);

          this.productos = this.productos.filter((p) => p.codigoQr !== qr);
          this.setActiveCategory(this.activeCategory);

          Swal.fire({
            title: '¡Eliminado!',
            text: 'El producto ha sido eliminado.',
            icon: 'success',
          });
        } catch (error: any) {
          this.productoServ.handleError(error);
        }
      }
    });
  }

  searchBar = '';

  change(event: Event) {
    console.log(this.searchBar);
    this.setActiveCategory(this.activeCategory);
    this.vista = this.buscarProductos();
  }

  private buscarProductos(): Producto[] {
    return this.vista.filter((producto) =>
      producto.nombre.toLowerCase().includes(this.searchBar.toLowerCase())
    );
  }

  calcularTotal(): number {
    let total = 0;
    for (let index = 0; index < this.carrito.length; index++) {
      const element = this.carrito[index];
      if (element.producto.oferta) {
        if (element.producto.nuevoPrecio > 0)
          total += element.cantidad * element.producto.nuevoPrecio;
      } else total += element.cantidad * element.producto.precioVenta;
    }
    return total;
  }

  calcularSinDescuento(): number {
    return this.carrito.reduce(
      (total, item) => total + item.producto.precioVenta * item.cantidad,
      0
    );
  }

  calcularDescuento(): number {
    let totalDescuento = 0;
    let precioNormal = 0;

    for (let index = 0; index < this.carrito.length; index++) {
      const element = this.carrito[index];

      if (element.producto.oferta) {
        precioNormal += element.cantidad * element.producto.precioVenta;

        if (element.producto.nuevoPrecio > 0)
          totalDescuento += element.cantidad * element.producto.nuevoPrecio;
      }
    }

    return precioNormal - totalDescuento;
  }

  hiddenSideBar() {
    this.visibilityService.showStatus()
      ? this.visibilityService.hide()
      : this.visibilityService.show();
  }

  async finishSale() {
    // Construir el HTML del ticket
    let htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Ticket de Venta</title>
    <style>
      @page {
        margin: 0;          /* quita márgenes del navegador */
        size: auto;         /* deja que la impresora decida tamaño */
      }
    body {
      margin: 0;          /* quita márgenes de body */
      display: flex;
      justify-content: left;
      padding-left: 15px;
      font-family: Arial, sans-serif;
    }
    .container {
      width: 265px;
      font-size: 14px;
      text-align: center;
    }
    h1, h2, h3 {
      margin: 5px 0;
    }
    .logo {
      width: 80px;
      height: auto;
      margin-bottom: 5px;
    }
    .info {
      font-size: 12px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      text-align: left;
      padding: 2px 0;
    }
    th {
      border-bottom: 1px dashed #000;
      text-align: center;
    }
    tfoot td {
      border-top: 1px dashed #000;
      font-weight: bold;
    }
    .td-origin {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
      flex-direction: column;
      text-align: center;
      font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
    <img class="logo" src="${this.negocio.logo_path}" alt="Logo">
    <h2>${this.negocio.nombre}</h2>
    <p class="info">
      ${this.negocio.direccion}<br>
      Tel: ${this.negocio.telefono}<br>
    </p>
    <table>
      <thead>
      <tr>
        <th>Producto</th>
        <th>Cant</th>
        <th>Precio</th>
        <th>Total</th>
      </tr>
      </thead>
      <tbody>
  `;

    let venta = new Venta();
    venta.usuario = this.user;
    let fecha = venta.fechaHora.toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    venta.folio = this.generarFolio();
    venta.subtotal = parseFloat(this.calcularSinDescuento().toFixed(2));
    venta.descuentoAplicado = parseFloat(this.calcularDescuento().toFixed(2));
    venta.totalVenta = parseFloat(this.calcularTotal().toFixed(2));

    let detalles: DetalleVenta[] = [];

    // Agregar productos del carrito al HTML
    for (const item of this.carrito) {
      let detalle = new DetalleVenta();
      detalle.producto = item.producto;
      detalle.cantidad = item.cantidad;
      detalle.precioUnit = parseFloat(item.producto.precioVenta.toFixed(2));

      detalle.descuentoUnit = item.producto.nuevoPrecio
        ? item.producto.precioVenta - item.producto.nuevoPrecio
        : 0;
      detalle.descuentoUnit = parseFloat(detalle.descuentoUnit.toFixed(2));

      if (detalle.descuentoUnit > detalle.precioUnit) {
        detalle.total = 0;
      } else {
        detalle.total = parseFloat(
          (
            (item.producto.nuevoPrecio ?? item.producto.precioVenta) *
            item.cantidad
          ).toFixed(2)
        );
      }

      detalles.push(detalle);

      const nombre = item.producto.nombre;

      htmlContent += `
      <tr>
        <td style="font-size: 11px; word-break: break-word; white-space: normal;">${nombre}</td>
        <td><div class="td-origin">${item.cantidad}</div></td>
        `;

      let precioVenta = item.producto.nuevoPrecio;
      if (precioVenta <= 0) precioVenta = 0.0;

      htmlContent += `<td><div class="td-origin">`;
      if (item.producto.nuevoPrecio) {
        htmlContent += `
          <label style="text-decoration: line-through; margin-bottom: 0px; font-size: 10px;">
            $${item.producto.precioVenta.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </label>
          $${precioVenta.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</div></td>
          `;
      } else {
        htmlContent += `
          $${item.producto.precioVenta.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</div></td>
          `;
      }

      htmlContent += `
        <td><div class="td-origin">$${detalle.total.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</div></td>
      </tr>
      `;
    }

    htmlContent += `
      </tbody>
      <tfoot>
      <tr>
        <td colspan="3">Total</td>
        <td>$${this.calcularTotal().toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
      </tr>
      </tfoot>
    </table>
    <br/>
    <hr/>
    <!-- Contenedor del código de barras -->
    <svg id="barcode"></svg>
    <p> Folio: ${venta.folio} </p>
    <p style="margin-top: 10px;">
      Fecha: ${fecha}
    </p>
    <p>¡Gracias por su compra!</p>
    <hr/>
    <div style="border-top: 1px dashed black; border-bottom: 1px dashed black; padding: 6px 0; font-size: 12px; text-align: center;">
      <p class="mb-1 fw-bold">--- POLÍTICAS DE GARANTÍA ---</p>
      <ul style="list-style: none; padding-left: 0; margin: 0; text-align: left; font-size: 11px; line-height: 1.3;">
        <li>✔ Indispensable presentar ticket.</li>
        <li>✔ Las pantallas / touch deben venir sin sello quitado o roto.</li>
        <li>✔ Sin haber sido pegada o traer residuos de pegamento.</li>
        <li>✔ Sin flex roto o conector dañado.</li>
        <li>✔ Que no esté quebrada la pieza.</li>
        <li>✔ Favor de revisar bien las piezas antes de retirarse.</li>
      </ul>
    </div>
    <hr/>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          const codigo = "${venta.folio}"; // tu número con guion
          JsBarcode("#barcode", codigo, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.5,
            height: 50,      // altura un poco mayor para mejor visibilidad
            displayValue: false,
            fontSize: 12,
            margin: 0
          });
        </script>
  </body>
  </html>
    `;

    try {
      const payload = { venta, detalles };

      console.log('Venta: ', venta);
      console.log('Detalles: ', detalles);

      await lastValueFrom(this.ventaServ.finalizarVenta(payload));
      (window as any).electronAPI.imprimirVariosTickets([htmlContent]);

      this.carrito = [];
    } catch (error: any) {
      this.productoServ.handleError(error);
    }
  }

  async exportLowStockCSV() {
    const { value: threshold } = await Swal.fire({
      title: 'Exportar productos con stock bajo',
      text: '¿Stock menor o igual a?',
      input: 'number',
      inputValue: 2,
      inputAttributes: { min: '0', step: '1' },
      showCancelButton: true,
      confirmButtonText: 'Exportar CSV',
      cancelButtonText: 'Cancelar',
    });

    if (threshold === undefined) return;

    const filtered = this.productos.filter(p => p.stock <= threshold);

    if (filtered.length === 0) {
      Swal.fire('Sin resultados', `No hay productos con stock ≤ ${threshold}.`, 'info');
      return;
    }

    const BOM = '\uFEFF';
    const rows = filtered.map(p => {
      const publicPrice = p.nuevoPrecio ?? p.precioVenta;
      return [
        p.codigoQr,
        `"${p.nombre}"`,
        `"${p.marca.nombre}"`,
        `"${p.modelo.nombre}"`,
        `"${p.categoria.nombre}"`,
        p.precioCosto.toFixed(2),
        p.precioNegocio.toFixed(2),
        publicPrice.toFixed(2),
        p.stock,
        p.stockMinimo,
      ].join(',');
    });

    const header = 'Código QR,Nombre,Marca,Modelo,Categoría,Precio Costo,Precio Negocio,Precio Público,Stock,Stock Mínimo';
    const csv = BOM + header + '\n' + rows.join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos_stock_bajo_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    Swal.fire('Exportado', `Se exportaron ${filtered.length} productos con stock ≤ ${threshold}.`, 'success');
  }

  private generarFolio(): string {
    const timestamp = Date.now(); // milisegundos desde 1970
    const random = Math.floor(Math.random() * 1000000); // número aleatorio
    return `${timestamp}${random}`;
  }
}
