import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { last, lastValueFrom } from 'rxjs';
import { MainService } from './services/main.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Pijulcel');

  constructor() {
  }


}
