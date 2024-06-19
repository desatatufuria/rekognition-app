import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, merge, switchMap, timer } from 'rxjs';
import { ParkingExit, ParkingSpot } from '../interfaces/parking';

@Injectable({
  providedIn: 'root'
})
export class ParkingHttpService {
  private baseUrl: string = 'https://localhost:7130';
  private baseUrl1: string = 'http://3.85.87.1';

  constructor(private http: HttpClient) { }

  getParkingSpots(): Observable<ParkingSpot[]> {
    return this.http.get<ParkingSpot[]>(`${this.baseUrl}/api/Parking/spots`);
  }

  getVehicles(): Observable<ParkingExit[]> {
    return this.http.get<ParkingExit[]>(`${this.baseUrl}/api/parking/vehicles`);
  }

  // Método para obtener datos cada 5 segundos (ejemplo)
  getParkingDataEveryFiveSeconds(): Observable<any> {
    return timer(0, 5000).pipe(
      switchMap(() => this.getParkingSpots())
    );
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
  registerCarExit(carData: { licensePlate: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Parking/exit`, carData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  fetchData(licensePlate: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Parking/CalculateParkingFee/${licensePlate}`);
  }

  // Upload License Plate Image
  uploadImage(blob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', blob, 'capturedPhoto.png');
    return this.http.post(`${this.baseUrl}/api/Image/upload`, formData);
  }


  // Paypal ,method to create payment
  createPayment(total: number, licensePlate: string): Observable<{ id: string, approvalUrl: string, qrCodeBase64: string }> {
    return this.http.post<{ id: string, approvalUrl: string, qrCodeBase64: string }>(
      `${this.baseUrl}/api/Payments/create-payment`,
      {
        total,
        baseUrl: `${this.baseUrl}/api/Payments`,
        licensePlate: licensePlate
      }
    );
  }

  // Paypal ,method to check payment status
  checkPaymentStatus(paymentId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/api/Payments/check-payment-status/${paymentId}`);
  }




  // Upload Captured Ticket Image
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
