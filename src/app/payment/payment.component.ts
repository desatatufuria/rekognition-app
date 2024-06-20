import { Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ParkingHttpService } from '../services/parking-http.service';
import { QrDataService } from '../services/qr-data.service';
import QrScanner from 'qr-scanner';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, lastValueFrom } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { TextToSpeechService } from '../services/text-to-speech.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  providers: [DatePipe]

})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  @Output() scanResult = new EventEmitter<string>(); // Emitir evento cuando se detecte un QR


  licensePlate: string | null = null;
  data: any = null;
  buttonDisabled: boolean = true;

  result: string | null = null;
  qrScanner!: QrScanner;
  qrCodeUrl: string = "";
  private qrDetected: boolean = false; 

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
  private qrDataSubscription: Subscription | undefined;

  countdownMinutes: number = 5; // Inicializar minutos restantes
  countdownSeconds: number = 0; // Inicializar segundos restantes
  countdownInterval: any;

  constructor(
    private parkingHttpService: ParkingHttpService,
    private datePipe: DatePipe,
    private qrDataService: QrDataService,
    private ngZone: NgZone,
    private textToSpeechService: TextToSpeechService,
    private http: HttpClient) { }

  ngOnInit() {
    this.initializeScanner();

    // Suscribirse al qrData$ y almacenar la suscripción para poder cancelarla en ngOnDestroy
    this.qrDataSubscription = this.qrDataService.qrData$.subscribe(data => {
      if (data) {
        console.log(data,"data")
        this.licensePlate = data;
        this.fetchData();
      }
    });
  }

  ngOnDestroy(): void {
    this.qrScanner.stop();
    if (this.qrDataSubscription) {
      this.qrDataSubscription.unsubscribe();
    }
    this.qrDataService.clearData();
    clearInterval(this.countdownInterval);
    // Limpiar el estado al salir del componente
    this.initMessage = true;
    this.buttonDisabled = true;
    this.result = null;
    this.data = null;
    this.hideAttr = true;
    this.licensePlate = null
    this.hideLicense = true;
    this.errorMessage = false;
    this.showResults = false;
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

  async setResult(result: any): Promise<void> {
    if (this.result === result.data) {
      this.initMessage = false;
      return; // Si el QR detectado es el mismo que el último, no hacer nada
    }

    this.result = result.data;
    console.log('QR Code detected:', this.result);
    await this.speakText(`Por favor, pulse el botón para generar su metodo de pago`);
    this.qrDataService.setQrData(this.result!); // Enviar el resultado al servicio
    this.scanResult.emit(this.result!); // Emitir el resultado para cualquier escucha externa

    // Iniciar el intervalo para actualizar el contador cada segundo
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);

    // Reiniciar el timeout cada vez que se detecta un nuevo QR válido
    clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      this.handleTimeout();
      this.initMessage = true;
      this.buttonDisabled = true;
      this.result = null; // Limpiar el resultado del QR
      this.data = null;
      this.licensePlate = null;
      this.hideLicense = true;
      this.errorMessage = false;
    }, 5 * 60 * 1000); // 5 minutos en milisegundos
  }



  fetchData() {
    if (!this.licensePlate) {
      console.error('License plate is null or empty.');
      return; // Otra acción como mostrar un mensaje de error o regresar temprano
    }
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


  async createPayment(): Promise<void> {
    if (!this.data || !this.data.parkingFee) {
      console.error('No se pudo crear el pago porque no hay datos válidos.');
      return;
    }
    await this.speakText(`Por favor, escanee el codigo QR para abonar el importe mediante el pago seguro Paypal.`);
    const parkingFee = this.data.parkingFee; // Obtener el importe del parkingFee de los datos
    if (!this.licensePlate) {
      console.error('License plate is null or empty.');
      return; // Otra acción como mostrar un mensaje de error o regresar temprano
    }
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
      .subscribe({
        next: async (response: any) => {
          this.paymentStatus = response.status;
          if (response.status === 'approved') {
            console.log('Payment approved!');
            await this.speakText(`Su pago ha sido completado. Puede retirar su vehículo`);
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
        },
        error: (error: any) => {
          console.error('Error checking payment status:', error);
        }
      });
  }
  private async speakText(text: string) {
    try {
      const audioBlob = await lastValueFrom(this.textToSpeechService.convertTextToSpeech(text));
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error al convertir texto a voz:', error);
    }
  }
}
