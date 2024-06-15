import { Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ParkingService } from '../services/parking.service';
import { QrDataService } from '../services/qr-data.service';
import QrScanner from 'qr-scanner';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.css'],
  providers: [DatePipe]
})
export class PaypalComponent implements OnInit, OnDestroy {
  licensePlate: string = ''; // Initialize licensePlate property
  data: any;

  buttonDisabled: boolean = true;

  qrCodeUrl: string = "";


  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  @Output() scanResult = new EventEmitter<string>(); // Emitir evento cuando se detecte un QR
  result: string | null = null;
  qrScanner!: QrScanner;
  private qrDetected: boolean = false; // Bandera para detectar si ya se ha procesado un QR

  constructor(private parkingService: ParkingService, private datePipe: DatePipe, private qrDataService: QrDataService, private ngZone: NgZone, private http: HttpClient) { }

  ngOnInit() {
    this.initializeScanner();

    //this.createPayment();

    // Suscribirse a los cambios en los datos del QR
    this.qrDataService.qrData$.subscribe(data => {
      if (data) {
        this.licensePlate = data;
        this.fetchData();
      }
    });
  }

  ngOnDestroy(): void {
    this.qrScanner.stop();
  }

  initializeScanner(): void {
    const videoElement = this.video.nativeElement;
    this.qrScanner = new QrScanner(
      videoElement,
      result => this.ngZone.run(() => this.setResult(result)),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    this.qrScanner.start();
  }

  setResult(result: any): void {
    if (this.qrDetected) {
      return; // Si ya se ha detectado y procesado un QR, no hacer nada
    }
    this.qrDetected = true;
    this.result = result.data;
    console.log('QR Code detected:', this.result);
    this.qrDataService.setQrData(this.result!); // Enviar el resultado al servicio
    this.scanResult.emit(this.result!); // Emitir el resultado para cualquier escucha externa
  }

  fetchData() {
    this.parkingService.fetchData(this.licensePlate).subscribe(
      (response) => {
        this.data = response;
        this.buttonDisabled = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  formatTime(dateTime: string): string {
    return this.datePipe.transform(dateTime, 'dd/MM/yyyy HH:mm:ss')!;
  }


  createPayment(): void {
    const baseUrl = window.location.origin;
    this.http.post<{ id: string, approvalUrl: string, qrCodeBase64: string }>('https://localhost:7130/api/Payments/create-payment', { total: 20.00, baseUrl: baseUrl })
      .subscribe(response => {
        if (response && response.approvalUrl) {
          this.qrCodeUrl = 'data:image/png;base64,' + response.qrCodeBase64; // Call generateQRCode only when approvalUrl is received
        } else {
          console.error('Invalid response from server:', response);
        }
      }, error => {
        console.error('Error creating payment:', error);
      });
  }




}
