import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { RegisterProduct } from './components/dashboard/register-product/register-product';
import { ListProducts } from './components/dashboard/list-products/list-products';
import { NegocioConfig } from './components/dashboard/negocio-config/negocio-config';
import { RegisterEntry } from './components/dashboard/register-entry/register-entry';
import { Descuentos } from './components/dashboard/descuentos/descuentos';
import { ReporteVentas } from './components/dashboard/reporte-ventas/reporte-ventas';
import { ReporteDevoluciones } from './components/dashboard/reporte-devoluciones/reporte-devoluciones';
import { CategMarcas } from './components/dashboard/categ-marcas/categ-marcas';
import { Devoluciones } from './components/dashboard/devoluciones/devoluciones';
import { ImprimirQr } from './components/dashboard/imprimir-qr/imprimir-qr';

export const routes: Routes = [
  { path: '', component: Login},
  { path: 'dashboard', component: Dashboard,
    children: [
    { path: 'register-product', component: RegisterProduct },
    { path: 'list-products', component: ListProducts },
    { path: 'config-negocio', component: NegocioConfig },
    { path: 'register-entry', component: RegisterEntry },
    { path: 'descuentos', component: Descuentos },
    { path: 'reporte-ventas', component: ReporteVentas },
    { path: 'reporte-devoluciones', component: ReporteDevoluciones },
    { path: 'categorias-marcas', component: CategMarcas },
    { path: 'devoluciones', component: Devoluciones },
    { path: 'imprimir-qr', component: ImprimirQr }
    ]
  }
];
