import { Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ParkingHttpService } from '../services/parking-http.service';
import { QrDataService } from '../services/qr-data.service';
import QrScanner from 'qr-scanner';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  providers: [DatePipe]

})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  @Output() scanResult = new EventEmitter<string>(); // Emitir evento cuando se detecte un QR


  licensePlate: string = ''; // Initialize licensePlate property
  data: any;
  buttonDisabled: boolean = true;



  result: string | null = null;
  qrScanner!: QrScanner;
  qrCodeUrl: string = "";
  private qrDetected: boolean = false; // Bandera para detectar si ya se ha procesado un QR



  paymentId: string | null = null;;
  approvalUrl: string | null = null;;
  qrCodeBase64: string | null = null;;
  paymentStatus: string | null = null;;




  constructor(
    private parkingHttpService: ParkingHttpService,
    private datePipe: DatePipe,
    private qrDataService: QrDataService,
    private ngZone: NgZone,
    private http: HttpClient) { }

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
    this.parkingHttpService.fetchData(this.licensePlate).subscribe(
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
    
    this.parkingHttpService.createPayment(20.00)
      .subscribe(response => {
        if (response && response.approvalUrl) {
          this.qrCodeBase64 = 'data:image/png;base64,' + response.qrCodeBase64;
          this.paymentId = response.id;
          this.approvalUrl = response.approvalUrl;
          this.checkPaymentStatus();
        } else {
          console.error('Invalid response from server:', response);
        }
      }, (error: any) => {
        console.error('Error creating payment:', error);
      });
  }

  checkPaymentStatus(): void {
    interval(5000)
      .pipe(
        switchMap(() => this.parkingHttpService.checkPaymentStatus(this.paymentId!)),
        takeWhile((response: any) => response.status !== 'approved', true)
      )
      .subscribe((response: any) => {
        this.paymentStatus = response.status;
        if (response.status === 'approved') {
          console.log('Payment approved!');
        } else {
          console.log('Payment status:', response.status);
        }
      }, (error: any) => {
        console.error('Error checking payment status:', error);
      });
  }


}
