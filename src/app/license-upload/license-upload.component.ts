import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

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
  capturedPhoto: string | null = null;

  plazasLibres: number | null = null;
  licensePlate: string | null = null;
  licenseIMG: string | null = null;

  licenseDecode: string | null = null;
  vehicleSpot: string | null = null;
  entryTime: string | null = null;

  ticket: boolean = false;

  loadingTicket: boolean = false;
  nolicense: boolean = true;
  parkingSpots: boolean = true;


  //url: string | null = null;
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

  //uploadCapturedPhoto2() {
  //  if (this.capturedPhoto) {
  //    const blob = this.dataURItoBlob(this.capturedPhoto);
  //    const formData = new FormData();
  //    formData.append('file', blob, 'capturedPhoto.png');

  //    this.http.post(this.url1 + '/api/Image/upload', formData)
  //      .subscribe(response => {
  //        this.jsonResponse = response;
  //       // console.log('Foto capturada subida correctamente', response);
  //        this.extractLicensePlate(response);
  //        this.checkPlazasLibres();
  //      }, error => {
  //        console.error('Error al subir la foto capturada', error);
  //      });
  //  }
  //}

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
            this.entryTime = this.datePipe.transform(rawEntryTime, 'yyyy-MM-dd / HH:mm:ss');


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

  //async uploadCapturedPhoto() {
  //   if (this.capturedPhoto) {
  //     const blob = this.dataURItoBlob(this.capturedPhoto);
  //     const formData = new FormData();
  //     formData.append('file', blob, 'capturedPhoto.png');

  //     try {
  //       const response = await this.http.post(this.url1 + '/api/Image/upload', formData).toPromise();
  //       this.jsonResponse = response;
  //       console.log(this.jsonResponse);

  //       const availableSpots = await this.checkPlazasLibres();
  //       if (availableSpots > 0) {
  //         console.log('Hay plazas libres:', availableSpots);
  //         // Realiza alguna acción si hay plazas libres
  //         let result = this.extractLicensePlate(response)
  //         if (result) {
  //           const registerCarResponse = await this.registerCar();
  //           console.log("qrcode:", registerCarResponse.qrCode);
  //           this.imageUrl = 'data:image/png;base64,' + registerCarResponse.qrCode;
  //         } else {
  //           console.log("Algo ha salido mal, vuelve a pulsar el botón")
  //         }
  //         //await this.showQrCode();
  //       } else {
  //         console.log('No hay plazas libres, por favor, espere');
  //         // Realiza alguna acción si no hay plazas libres
  //       }
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   }
  // }


  async checkPlazasLibres(): Promise<number> {
    try {
      const response = await this.http.get<{ availableSpots: number }>(`${this.url1}/api/Parking/status`).toPromise();
      const availableSpots: number = response!.availableSpots;
      // this.plazasLibres = availableSpots;
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

    //console.log('Type of response.textDetections:', typeof response.textDetections);
    //console.log(textDetections.length, "textDetections");

    if (textDetections && textDetections.length > 0) {
      const normalizeText = (text: string) => text.replace(/\s/g, ' ');

      // Filtramos las detecciones de texto que coincidan con el formato de matrícula
      const licensePlateCandidates = textDetections.filter((text: string) => {
        const normalizedText = normalizeText(text);
        // console.log(`Evaluating text: "${normalizedText}"`);



        // Verificar si el texto es una matrícula válida
        const platePattern = /^\d{4} [A-Z]{3}$/;
        const fullPattern = /^\d{4} [A-Z]{3} \(\d{1,3}[.,]\d{2}%\)$/;
        const isValidPlate = platePattern.test(normalizedText) || fullPattern.test(normalizedText);
        //console.log(`Text: "${normalizedText}", IsValidPlate: ${isValidPlate}`);
        return isValidPlate;
      });

      console.log(licensePlateCandidates.length, "licensePlateCandidates");

      // Si encontramos una detección que coincida con el formato de matrícula
      if (licensePlateCandidates.length > 0) {
        console.log("entro?");
        const matchedPlate = licensePlateCandidates[0];
        // Extraer los primeros 7 caracteres relevantes (4 números + 3 letras) y el porcentaje de confianza
        const matchedParts = matchedPlate.match(/^(\d{4} [A-Z]{3})( \((\d{1,3}[.,]\d{2})%\))?$/);
        //console.log (matchedParts, "matchedParts")

        if (matchedParts) {
          const plate = matchedParts[1].replace(' ', '');

          let confidence = matchedParts[3]; // sin el símbolo de porcentaje

          const result = `${plate};${confidence}`;
          console.log('Matrícula detectada:', result);
          //console.log(matchedParts[0]);
          // console.log(matchedParts[1]);
          if (matchedParts[3]) console.log(matchedParts[3], "matchedParts[3]");
          // Convertir a Base64
          this.licensePlate = btoa(result);
          this.licenseIMG = response.fileUrl;
          console.log(this.licenseIMG, "imagen license");
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



  registerCarq() {
    console.log('Registrando coche en un hueco libre...');

    const carData = { licensePlate: this.licensePlate, licenseIMG: this.licenseIMG }; // Datos del coche que quieras registrar

    this.http.post(this.url1 + '/api/Parking/enter', carData, {
      headers: { 'Content-Type': 'application/json' }
    })
      .subscribe((response: any) => {
        console.log('Coche registrado correctamente', response);
        return response
        // Actualiza el estado o muestra un mensaje de confirmación
      }, error => {
        console.error('Error al registrar el coche', error);
        return error
      });

  }


  async registerCar(): Promise<any> {
    console.log('Registrando coche en un hueco libre...');
    console.log(this.licensePlate, "licensePlate")
    console.log(this.licenseIMG, "licenseIMG")
    const carData = { licensePlate: this.licensePlate, licenseIMG: this.licenseIMG }; // Datos del coche que quieras registrar

    try {
      const response = await this.http.post(this.url1 + '/api/Parking/enter', carData, {
        headers: { 'Content-Type': 'application/json' }
      }).toPromise();
      console.log('Coche registrado correctamente', response);
      return response;
    } catch (error) {
      console.error('Error al registrar el coche', error);
      throw error; // Propaga el error para que el llamador pueda manejarlo
    }
  }



  //metodo para recoger el qrcode de la matricula del vehiculo registrado
  //async getQrCode(): Promise<string> {
  //  try {
  //    const response = await this.http.get<{ qrCode: string }>(`${this.url1}/api/Parking/vehicles`).toPromise();
  //    return response!.qrCode;
  //  } catch (error) {
  //    console.error('Error al obtener el qrcode', error);
  //    throw error;  // Propaga el error para que el llamador pueda manejarlo
  //  }
  //}

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

  //metodo para mostrar el qrcode en pantalla
  async showQrCode() {
    try {
      const qrCode = await this.getQrCode();
      this.imageUrl = 'data:image/png;base64,' + qrCode;
    } catch (error) {
      console.error('Error al mostrar el qrcode', error);
    }
  }

}
