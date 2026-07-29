import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { lastValueFrom } from 'rxjs';
import { Producto } from '../../../models/Producto';
import JsBarcode from 'jsbarcode';
import { DescuentoCategoria } from '../../../models/DescuentoCategoria';
import { DescuentoMarca } from '../../../models/DescuentoMarca';
import { DescuentoProducto } from '../../../models/DescuentoProducto';
import { DescuentoService } from '../../../services/descuento.service';
import Swal from 'sweetalert2';
import { Categoria } from '../../../models/Categoria';
import { CategoriaService } from '../../../services/categoria.service';

interface Carrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-imprimir-qr',
  imports: [CommonModule, FormsModule],
  templateUrl: './imprimir-qr.html',
  styleUrl: './imprimir-qr.css',
})
export class ImprimirQr implements OnInit {
  public listDescCateg: DescuentoCategoria[] = [];
  public listDescMarca: DescuentoMarca[] = [];
  public listDescProd: DescuentoProducto[] = [];

  carrito: Carrito[] = [];
  listProductos: Producto[] = [];
  categories: Categoria[] = [];

  vista: Producto[] = [];

  url_store: string;

  constructor(
    private productServ: ProductoService,
    private descServ: DescuentoService,
    private categServ: CategoriaService
  ) {
    this.url_store = productServ.url_store;
  }

  async ngOnInit() {
    try {
      this.listProductos = await lastValueFrom(this.productServ.getAll());
      this.categories = await lastValueFrom(this.categServ.getAll());

      this.vista = this.listProductos;

      // Fetch all discounts
      let res = await lastValueFrom(this.descServ.getAll());

      // Filter discounts by categories, brands, and products
      this.filterDescuento(this.listDescCateg, res.ByCategorias, 0);
      this.filterDescuento(this.listDescMarca, res.ByMarcas, 1);
      this.filterDescuento(this.listDescProd, res.ByProductos, 2);
    } catch (error: any) {
      this.productServ.handleError(error);
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
        for (let f = 0; f < this.listProductos.length; f++) {
          // Get the current product
          const producto = this.listProductos[f];

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

  removeFromCart(item: Carrito) {
    const index = this.carrito.indexOf(item);
    if (index > -1) {
      this.carrito.splice(index, 1);
    }
  }

  async imprimirTickets(): Promise<void> {
    console.log(this.carrito);
    let tickets: string[] = [];
    // Aquí puedes implementar la lógica para imprimir los tickets
    for (let index = 0; index < this.carrito.length; index++) {
      const element = this.carrito[index];
      console.log(
        `Imprimiendo ticket para: ${element.producto.nombre}, Cantidad: ${element.cantidad}`
      );
      let res = await this.ticketHTML(element.producto, element.cantidad);
      tickets = tickets.concat(res);
    }
    (window as any).electronAPI.imprimirVariosTickets(tickets);
    console.log('Todos los tickets impresos con corte por ticket');

  }

  async ticketHTML(item: Producto, cantidad: number): Promise<string[]> {
    const precioOriginal = item.precioVenta.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });
    const precioNuevo =
      item.nuevoPrecio > 0
        ? item.nuevoPrecio.toLocaleString('es-MX', {
          style: 'currency',
          currency: 'MXN',
        })
        : '';
    const esGratis = item.nuevoPrecio <= 0;

    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      @page {
        margin: 0;
        size: auto;
      }
      body {
        margin: 0;
        padding-left: 15px;
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: left;
      }
      .container {
        width: 265px;
        font-size: 14px;
        text-align: center;
      }
      .precio {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
      }
      .precio span {
        font-size: 14px;
      }
      .tachado {
        text-decoration: line-through;
        color: #888;
        margin-left: 5px;
      }
      .gratis {
        font-weight: bold;
        color: green;
      }
      svg {
        margin-top: 10px;
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h6>${item.nombre}</h6>
      <svg id="barcode"></svg>

      <div class="precio">
        <span>Precio:</span>
        <span>
          ${esGratis
        ? '<span class="gratis">Gratis</span>'
        : precioNuevo || precioOriginal
      }
          ${item.nuevoPrecio > 0
        ? `<span class="tachado">${precioOriginal}</span>`
        : ''
      }
        </span>
      </div>
      <br/>
      <hr/>
    </div>


    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script>
      JsBarcode("#barcode", "${item.codigoQr}", {
        format: "CODE128",
        lineColor: "#000",
        width: 1.5,
        height: 30,
        displayValue: true,
        fontSize: 12,
        margin: 0
      });
    </script>
  </body>
  </html>
  `;
    let tickets = [];
    for (let i = 0; i < cantidad; i++) {
      tickets.push(htmlContent);
    }
    return tickets;
  }

  activeCategory = 'Todo';

  setActiveCategory(category: string) {
    this.activeCategory = category;
    if (category === 'Todo') {
      this.vista = this.listProductos;
    } else {
      this.vista = this.listProductos.filter(
        (producto) => producto.categoria.nombre === category
      );
    }
  }

  generateQR(producto: Producto): void {
    JsBarcode('#bc_' + producto.codigoQr, producto.codigoQr, {
      format: 'CODE128',
      lineColor: '#000',
      width: 2,
      height: 40,
      displayValue: true,
    });
  }

  addCart(product: any): void {
    const existingItem = this.carrito.find(
      (item) => item.producto.codigoQr === product.codigoQr
    );

    if (existingItem) {
      existingItem.cantidad++;
    } else {
      this.carrito.push({ producto: product, cantidad: 1 });
    }
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
        const producto = this.listProductos.find(
          (p) => p.codigoQr === codigoQr
        );
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
}
