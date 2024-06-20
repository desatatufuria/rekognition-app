import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrDataService {
  private qrDataSubject = new BehaviorSubject<string | null>(null);
  qrData$ = this.qrDataSubject.asObservable();

  setQrData(data: string) {
    this.qrDataSubject.next(data);
  }

  clearData(): void {
    this.qrDataSubject.next(null); // Limpia data asignando null
  }
}
