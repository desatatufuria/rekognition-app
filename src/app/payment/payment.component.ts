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

  paymentId: string | null = null;
  approvalUrl: string | null = null;
  qrCodeBase64: string | null = null;
  paymentStatus: string | null = null;

  hideAttr: boolean = true;
  hideLicense: boolean = true;

  initMessage: boolean = true;
  errorMessage: boolean = false;


  showResults: boolean = false;


  private timeoutRef: any;


  countdownMinutes: number = 5; // Inicializar minutos restantes
  countdownSeconds: number = 0; // Inicializar segundos restantes
  countdownInterval: any;

  constructor(
    private parkingHttpService: ParkingHttpService,
    private datePipe: DatePipe,
    private qrDataService: QrDataService,
    private ngZone: NgZone,
    private http: HttpClient) { }

  ngOnInit() {
    this.initializeScanner();

    // Iniciar el intervalo para actualizar el contador cada segundo
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);

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

    // Limpiar el intervalo al destruir el componente para evitar fugas de memoria
    clearInterval(this.countdownInterval);
  }

  updateCountdown(): void {
    // Reducir el tiempo restante cada segundo
    if (this.countdownSeconds > 0) {
      this.countdownSeconds--;
    } else if (this.countdownMinutes > 0) {
      this.countdownMinutes--;
      this.countdownSeconds = 59; // Reiniciar los segundos
    } else {
      // Cuando el contador llega a cero, realizar las acciones necesarias
      clearInterval(this.countdownInterval); // Detener el intervalo
      this.handleTimeout(); // Llamar a la función que maneja el timeout
    }
  }

  handleTimeout(): void {
    // Aquí colocas la lógica que deseas ejecutar cuando se complete el tiempo de espera (5 minutos)
    console.log('Timeout reached after 5 minutes.');
    // Restablecer variables o estado necesario
    this.initMessage = true;
    this.buttonDisabled = true;
    this.result = null; // Limpiar el resultado del QR
    // También podrías reiniciar otros estados según tu lógica de la aplicación
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
    if (this.result === result.data) {
      this.initMessage = false;
      return; // Si el QR detectado es el mismo que el último, no hacer nada
    }

    this.result = result.data;
    console.log('QR Code detected:', this.result);
    this.qrDataService.setQrData(this.result!); // Enviar el resultado al servicio
    this.scanResult.emit(this.result!); // Emitir el resultado para cualquier escucha externa

    // Reiniciar el timeout cada vez que se detecta un nuevo QR válido
    clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      this.handleTimeout();
      this.initMessage = true;
      this.buttonDisabled = true;
      this.result = null; // Limpiar el resultado del QR
      this.data = null;
      this.licensePlate = '';
      this.hideLicense = true;
      this.errorMessage = false;
    }, 5 * 60 * 1000); // 5 minutos en milisegundos
  }



  fetchData() {
    this.parkingHttpService.fetchData(this.licensePlate).subscribe(
      (response) => {
        this.data = response;
        this.buttonDisabled = false;
        this.showResults = true;
        this.hideLicense = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.errorMessage = true;
        this.licensePlate = '';
        this.hideLicense = true;
        this.data = null;

        setTimeout(() => {
          this.errorMessage = false;
          this.initMessage = true;
          this.buttonDisabled = true;
          this.result = null; // Limpiar el resultado del QR
          this.hideLicense = true;
        }, 10000);
      }
    );
  }

  formatTime(dateTime: string): string {
    return this.datePipe.transform(dateTime, 'dd/MM/yyyy HH:mm:ss')!;
  }


  createPayment(): void {
    if (!this.data || !this.data.parkingFee) {
      console.error('No se pudo crear el pago porque no hay datos válidos.');
      return;
    }

    const parkingFee = this.data.parkingFee; // Obtener el importe del parkingFee de los datos

    this.parkingHttpService.createPayment(parkingFee, this.licensePlate)
      .subscribe(response => {
        if (response && response.approvalUrl) {
          this.qrCodeBase64 = 'data:image/png;base64,' + response.qrCodeBase64;
          this.paymentId = response.id;
          this.approvalUrl = response.approvalUrl;
          this.checkPaymentStatus();
          this.hideAttr = false;
          this.buttonDisabled = true;

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

          setTimeout(() => {
            this.initMessage = true;
            this.buttonDisabled = true;
            this.result = null; 
            this.hideLicense = true;
            this.data = null;
            this.hideAttr = true;
            this.showResults = false;
            this.licensePlate = '';
          }, 10000);
        } else {
          console.log('Payment status:', response.status);
        }
      }, (error: any) => {
        console.error('Error checking payment status:', error);
      });
  }

}
