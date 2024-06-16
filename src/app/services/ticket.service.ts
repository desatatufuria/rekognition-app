import { Injectable, ElementRef } from '@angular/core';
import html2canvas from 'html2canvas';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TicketService {

  constructor(private http: HttpClient) { }

  captureTicket(ticketDiv: ElementRef): Promise<string> {
    return new Promise((resolve, reject) => {
      // Forzar un retraso de 500ms antes de capturar el ticket
      setTimeout(() => {
        ticketDiv.nativeElement.style.animation = 'none';
        ticketDiv.nativeElement.style.opacity = '1';
        html2canvas(ticketDiv.nativeElement, { scale: 2, useCORS: true }).then(canvas => {
          resolve(canvas.toDataURL('image/png'));
        }).catch(error => {
          reject(error);
        });
      }, 500);
    });
  }
}
