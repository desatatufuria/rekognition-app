import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-exit-parking',
  templateUrl: './exit-parking.component.html',
  styleUrls: ['./exit-parking.component.css'],
  providers: [DatePipe]
})
export class ExitParkingComponent implements AfterViewInit {
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  jsonResponse: any = null;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef;
  capturedPhoto: string | null = null;

  licensePlate: string | null = null;
  licenseIMG: string | null = null;

  licenseDecode: string | null = null;
  vehicleSpot: string | null = null;
  entryTime: string | null = null;

  ticket: boolean = false;

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

        let result = this.extractLicensePlate(response)
        if (result) {
          // En lugar de registrar la entrada, registramos la salida
          const registerCarResponse = await this.registerCarExit();
          console.log("Hora de salida registrada:", registerCarResponse.exitTime);
          this.loadingTicket = false;
          this.parkingSpots = true;
        } else {
          console.log("Algo ha salido mal, vuelve a pulsar el botón")
          this.nolicense = false;
          this.loadingTicket = false;
        }
      }
    } catch (error) {
      console.error('Error:', error);
      this.loadingTicket = false;
      this.nolicense = false;
    }
  }

  async registerCarExit(): Promise<any> {
    console.log('Registrando salida del vehículo...');

    //const carData = { licensePlate: this.licensePlate }; // Solo se envía la matrícula
    console.log(this.licensePlate, "licensePlate");

    //decode licensePlate
    this.licensePlate = atob(this.licensePlate || '');
    this.licensePlate=this.licensePlate.split(';')[0];
    console.log(this.licensePlate, "licensePlate");

    //this.licensePlate = "0411KMT";
    const carData = { licensePlate: this.licensePlate };
    
    try {
      const response = await this.http.post(this.url1 + '/api/Parking/exit', carData, {
        headers: { 'Content-Type': 'application/json' }
      }).toPromise();
      console.log('Salida del vehículo registrada correctamente:', response);
      return response;
    } catch (error) {
      console.error('Error al registrar la salida del vehículo:', error);
      throw error;
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
          console.log('Matrícula en Base64:', this.licensePlate);
          return true
        }
      } else {
        console.log('No se encontró una matrícula válida en el JSON.');
        return false
      }
      return false
    }
    return false
  }
}
