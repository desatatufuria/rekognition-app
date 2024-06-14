import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingHttpService {
  private baseUrl: string = 'https://localhost:7130';

  constructor(private http: HttpClient) { }

  uploadImage(blob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', blob, 'capturedPhoto.png');
    return this.http.post(`${this.baseUrl}/api/Image/upload`, formData);
  }

  checkAvailableSpots(): Observable<{ availableSpots: number }> {
    return this.http.get<{ availableSpots: number }>(`${this.baseUrl}/api/Parking/status`);
  }

  registerCar(licensePlate: string | null, licenseIMG: string | null): Observable<any> {
    const carData = { licensePlate, licenseIMG };
    return this.http.post(`${this.baseUrl}/api/Parking/enter`, carData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  uploadCapturedTicketImage(imageData: string): Observable<any> {
    const blob = this.dataURItoBlob(imageData);
    const formData = new FormData();
    formData.append('file', blob, 'capturedTicket.png');
    return this.http.post(`${this.baseUrl}/api/Image/uploadAndSendToTelegram`, formData);
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  }
}
