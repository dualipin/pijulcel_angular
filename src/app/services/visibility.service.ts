// visibility.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisibilityService {
  private _showElement = new BehaviorSubject<boolean>(true);
  showElement$ = this._showElement.asObservable();

  show() {
    this._showElement.next(true);
  }

  hide() {
    this._showElement.next(false);
  }

  showStatus(): Boolean {
    return this._showElement.getValue();
  }
}
