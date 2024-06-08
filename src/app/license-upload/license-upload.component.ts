import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-license-upload',
  templateUrl: './license-upload.component.html',
  styleUrls: ['./license-upload.component.css']
})
export class LicenseUploadComponent implements AfterViewInit {
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  jsonResponse: any = null;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef;
  capturedPhoto: string | null = null;

  plazasLibres: boolean | null = null;
  licensePlate: string | null = null;

  licenseIMGURL: string | null = null;

  url: string | null = null;
  url1: string = "http://3.85.87.1"
  url2: string = "http://localhost:7130/"


  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    this.startCamera();
  }


  startCamera() {
    const video = this.videoElement.nativeElement;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('Error accessing the camera: ', err);
      });
  }

  capture() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.capturedPhoto = canvas.toDataURL('image/png');
  }

  uploadCapturedPhoto() {
    if (this.capturedPhoto) {
      const blob = this.dataURItoBlob(this.capturedPhoto);
      const formData = new FormData();
      formData.append('file', blob, 'capturedPhoto.png');

      this.http.post(this.url1 + '/api/Image/upload', formData)
        .subscribe(response => {
          this.jsonResponse = response;
          console.log('Foto capturada subida correctamente', response);
          this.extractLicensePlate(response);
          this.checkPlazasLibres();
        }, error => {
          console.error('Error al subir la foto capturada', error);
        });
    }
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post(this.url1 + '/api/Image/upload', formData)
        .subscribe(response => {
          this.jsonResponse = response;
          console.log(this.jsonResponse);
          this.checkPlazasLibres();
          console.log('Plazas libres:', this.plazasLibres);
        }, error => {
          console.error('Error:', error);
        });
    }
  }


  checkPlazasLibres() {
    this.http.get(this.url1 + '/api/Parking/status')
      .subscribe((response: any) => {
        this.plazasLibres = response.availableSpots;
        console.log(response, "response");
        console.log('Plazas libres:', this.plazasLibres);
        this.registerCar();
      }, error => {
        console.error('Error al comprobar las plazas libres', error);
      });
  }

  extractLicensePlate(response: any) {
    //console.log('Response:', response);
    const textDetections = response.textDetections;
    //console.log('Text Detections:', textDetections);

    if (textDetections && textDetections.length > 0) {
      // Filtramos las detecciones de texto que coincidan con el formato de matrícula
      const licensePlateCandidates = textDetections.filter((text: string) => {
        const isValidPlate = /^\d{4} [A-Z]{3} \(\d{1,3}\.\d{2}%\)$/.test(text);
        console.log(`Text: ${text}, IsValidPlate: ${isValidPlate}`);
        return isValidPlate;
      });

      // Si encontramos una detección que coincida con el formato de matrícula
      if (licensePlateCandidates.length > 0) {
        const matchedPlate = licensePlateCandidates[0];
        // Extraer los primeros 7 caracteres relevantes (4 números + 3 letras) y el porcentaje de confianza
        const matchedParts = matchedPlate.match(/^(\d{4} [A-Z]{3}) \((\d{1,3}\.\d{2})%\)$/);

        if (matchedParts) {
          const plate = matchedParts[1].replace(' ', '');
          let confidence = matchedParts[2]; // sin el símbolo de porcentaje
          confidence = confidence.replace('.', ','); // Cambiar el punto por coma
          const result = `${plate};${confidence}`;
          console.log('Matrícula detectada:', result);
          console.log(matchedParts[0])
          console.log(matchedParts[1])
          console.log(matchedParts[2])

          // Convertir a Base64
          this.licensePlate = btoa(result);
          this.licenseIMGURL = textDetections.fileName;
          console.log(this.licenseIMGURL, "imagen license")
          console.log('Matrícula en Base64:', this.licensePlate);
        }
      } else {
        console.log('No se encontró una matrícula válida en el JSON.');
      }
    }
  }





  registerCar() {
    console.log('Registrando coche en un hueco libre...');
    const carData = { licensePlate: this.licensePlate }; // Datos del coche que quieras registrar

    this.http.post(this.url1 + '/api/Parking/enter', carData)
      .subscribe((response: any) => {
        console.log('Coche registrado correctamente', response);
        // Actualiza el estado o muestra un mensaje de confirmación
      }, error => {
        console.error('Error al registrar el coche', error);
      });
  }

}
