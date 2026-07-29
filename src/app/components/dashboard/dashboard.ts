import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { VisibilityService } from '../../services/visibility.service';
import { Negocio } from '../../models/Negocio';

export interface Metric {
  title: string;
  value: string;
  change: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  // dashboard.component.ts
  metrics: Metric[] = [
    { title: 'Ganancia', value: '$12,628', change: '↑ 72.80%', bgColor: 'success' },
    { title: 'Ventas', value: '$4,679', change: '↑ 28.42%', bgColor: 'primary' },
    { title: 'Pagos', value: '$2,456', change: '↓ 14.82%', bgColor: 'danger' },
    { title: 'Transacciones', value: '$14,857', change: '↑ 28.14%', bgColor: 'warning' }
  ];
  showNav = true;

  negocio:Negocio = new Negocio();

  isAdmin: boolean = localStorage.getItem("rol") === "1";
  constructor(private visibilityService: VisibilityService, private _router: Router) {

  }

  ngOnInit() {

    this.visibilityService.showElement$.subscribe(value => {
      this.showNav = value;
    });

    let negocio = localStorage.getItem("negocio");
    if (negocio != null)
      this.negocio = JSON.parse(negocio);

    console.log(this.negocio);

  }

  cerrarSesion() {
    (window as any).electronAPI.desactivarRedimension();
    this._router.navigateByUrl("/");
  }

}
