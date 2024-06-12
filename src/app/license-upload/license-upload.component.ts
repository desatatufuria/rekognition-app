import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-license-upload',
  templateUrl: './license-upload.component.html',
  styleUrls: ['./license-upload.component.css'],
  providers: [DatePipe]
})
export class LicenseUploadComponent implements AfterViewInit {
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  jsonResponse: any = null;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef;
  @ViewChild('ticketDiv') ticketDiv!: ElementRef;
  capturedPhoto: string | null = null;
  capturedTicketImage: string | null = null;

  plazasLibres: number | null = null;
  licensePlate: string | null = null;
  licenseIMG: string | null = null;

  licenseDecode: string | null = null;
  vehicleSpot: string | null = null;
  entryTime: string | null = null;

  ticket: boolean = false;
  ticketVisible: boolean = true; // Inicialmente visible
  private ticketTimeout: any; // Variable para almacenar el timeout

  loadingTicket: boolean = false;
  nolicense: boolean = true;
  parkingSpots: boolean = true;

  url: string = "http://3.85.87.1"
  url1: string = "https://localhost:7130"

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  ngAfterViewInit() {
    this.startCamera();
  }

  startCamera() {
    const video = this.videoElement.nativeElement;
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      video.srcObject = stream;
      video.play();
    }).catch(err => {
      console.error("Error accessing the camera", err);
    });
  }

  capture2() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.capturedPhoto = canvas.toDataURL('image/png');
  }

  capture() {
    return new Promise((resolve, reject) => {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedPhoto = canvas.toDataURL('image/png');
      resolve(null); // Resolvemos la promesa una vez que la captura está completa
    });
  }

  dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  }

  async captureAndUpload() {
    try {
      // Limpiar estado anterior
      this.loadingTicket = false;
      this.nolicense = true;
      this.parkingSpots = true;
      this.imageUrl = null;
      this.licenseDecode = null;
      this.vehicleSpot = null;
      this.ticket = false;

      await this.capture(); // Capturamos la imagen
      this.loadingTicket = true;

      if (this.capturedPhoto) {
        const blob = this.dataURItoBlob(this.capturedPhoto);
        const formData = new FormData();
        formData.append('file', blob, 'capturedPhoto.png');

        const response = await this.http.post(this.url1 + '/api/Image/upload', formData).toPromise();
        this.jsonResponse = response;
        console.log(this.jsonResponse);

        const availableSpots = await this.checkPlazasLibres();
        if (availableSpots > 0) {
          console.log('Hay plazas libres:', availableSpots);
          let result = this.extractLicensePlate(response)
          if (result) {
            const registerCarResponse = await this.registerCar();
            console.log("qrcode:", registerCarResponse.qrCode);
            this.imageUrl = 'data:image/png;base64,' + registerCarResponse.qrCode;
            this.licenseDecode = registerCarResponse.licensePlate;
            this.vehicleSpot = registerCarResponse.parkingSpotId;

            // Formatear solo la fecha en UTC
            const rawEntryTime = new Date(registerCarResponse.entryTime);
            this.entryTime = this.datePipe.transform(rawEntryTime, 'dd-MM-yyyy / HH:mm:ss');

            this.ticket = true;
            this.loadingTicket = false;
            this.parkingSpots = true;
          } else {
            console.log("Algo ha salido mal, vuelve a pulsar el botón")
            this.nolicense = false;
            this.loadingTicket = false;
          }
        } else {
          console.log('No hay plazas libres, por favor, espere');
          this.parkingSpots = false;
          this.loadingTicket = false;
        }
      }
    } catch (error) {
      console.error('Error:', error);
      this.loadingTicket = false;
      this.nolicense = false;
    }
  }

  async checkPlazasLibres(): Promise<number> {
    try {
      const response = await this.http.get<{ availableSpots: number }>(`${this.url1}/api/Parking/status`).toPromise();
      const availableSpots: number = response!.availableSpots;
      console.log('Plazas libres:', availableSpots);
      return availableSpots;
    } catch (error) {
      console.error('Error al comprobar las plazas libres', error);
      throw error;  // Propaga el error para que el llamador pueda manejarlo
    }
  }

  extractLicensePlate(response: any) {
    console.log('Response:', response);
    const textDetections = response.textDetections.map((encodedText: string) => {
      return atob(encodedText);
    });

    if (textDetections && textDetections.length > 0) {
      const normalizeText = (text: string) => text.replace(/\s/g, ' ');

      const licensePlateCandidates = textDetections.filter((text: string) => {
        const normalizedText = normalizeText(text);
        const platePattern = /^\d{4} [A-Z]{3}$/;
        const fullPattern = /^\d{4} [A-Z]{3} \(\d{1,3}[.,]\d{2}%\)$/;
        const isValidPlate = platePattern.test(normalizedText) || fullPattern.test(normalizedText);
        return isValidPlate;
      });

      if (licensePlateCandidates.length > 0) {
        const matchedPlate = licensePlateCandidates[0];
        const matchedParts = matchedPlate.match(/^(\d{4} [A-Z]{3})( \((\d{1,3}[.,]\d{2})%\))?$/);

        if (matchedParts) {
          const plate = matchedParts[1].replace(' ', '');
          let confidence = matchedParts[3];
          const result = `${plate};${confidence}`;
          this.licensePlate = btoa(result);
          this.licenseIMG = response.fileUrl;
          return true;
        }
      } else {
        console.log('No se encontró una matrícula válida en el JSON.');
        return false;
      }
      return false;
    }
    return false;
  }

  async registerCar(): Promise<any> {
    console.log('Registrando coche en un hueco libre...');
    const carData = { licensePlate: this.licensePlate, licenseIMG: this.licenseIMG };

    try {
      const response = await this.http.post(this.url1 + '/api/Parking/enter', carData, {
        headers: { 'Content-Type': 'application/json' }
      }).toPromise();
      console.log('Coche registrado correctamente', response);
      return response;
    } catch (error) {
      console.error('Error al registrar el coche', error);
      throw error;
    }
  }

  async getQrCode() {
    try {
      const response = await this.http.get<any[]>(this.url1 + '/api/Parking/vehicles').toPromise();
      console.log(response![0].qrCode);
      return response![0].qrCode;
    } catch (error) {
      console.error('Error al obtener el qrcode del vehiculo', error);
      throw error;
    }
  }

  async showQrCode() {
    try {
      const qrCode = await this.getQrCode();
      this.imageUrl = 'data:image/png;base64,' + qrCode;
    } catch (error) {
      console.error('Error al mostrar el qrcode', error);
    }
  }

  captureTicket() {
    if (this.ticketDiv) {
      // Temporalmente desactivar la animación
      this.ticketDiv.nativeElement.style.animation = 'none';
      this.ticketDiv.nativeElement.style.opacity = '1';

      // Esperar a que la animación original haya terminado
      setTimeout(() => {
        html2canvas(this.ticketDiv.nativeElement, { scale: 2, useCORS: true }).then(canvas => {
          this.capturedTicketImage = canvas.toDataURL('image/png');

          // Ocultar el ticket dinámico generado
          this.ticketVisible = false;

          // Iniciar el temporizador para ocultar el ticket después de 10 segundos
          this.startTicketTimer();

          // Restaurar la animación después de la captura
          //this.ticketDiv.nativeElement.style.animation = 'slideDown 1s forwards';

          // Enviar la imagen al backend
          this.uploadCapturedImage(this.capturedTicketImage);

        }).catch(error => {
          console.error('Error capturing the ticket div:', error);
        });
      }, 1000); // Asegúrate de que este tiempo coincida con la duración de tu animación
    }
  }

  startTicketTimer() {
    // Reinicia el temporizador si ya está activo para evitar múltiples contadores
    if (this.ticketTimeout) {
      clearTimeout(this.ticketTimeout);
    }

    // Configura el temporizador para ocultar el ticket después de 10 segundos
    this.ticketTimeout = setTimeout(() => {
      this.ticketVisible = false;
      this.capturedTicketImage = null; // Limpiar la imagen capturada si es necesario
    }, 10000); // 10000 milisegundos = 10 segundos
  }

  // Método para cancelar el temporizador si el ticket se cierra manualmente antes del tiempo
  cancelTicketTimer() {
    if (this.ticketTimeout) {
      clearTimeout(this.ticketTimeout);
    }
  }

  uploadCapturedImage(imageData: string) {
    const blob = this.dataURItoBlob(imageData);
    const formData = new FormData();
    formData.append('file', blob, 'capturedTicket.png');

    this.http.post(`${this.url1}/api/Image/uploadAndSendToTelegram`, formData).subscribe(response => {
      console.log('Image uploaded to backend:', response);
    }, error => {
      console.error('Error uploading image to backend:', error);
    });
  }
}
