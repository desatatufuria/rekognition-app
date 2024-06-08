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
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.capturedPhoto = canvas.toDataURL('image/png');
  }

  uploadCapturedPhoto() {
    if (this.capturedPhoto) {
      const blob = this.dataURItoBlob(this.capturedPhoto);
      const formData = new FormData();
      formData.append('file', blob, 'capturedPhoto.png');

      this.http.post('http://3.85.87.1/api/Image/upload', formData)
        .subscribe(response => {
          this.jsonResponse = response;
          console.log('Foto capturada subida correctamente', response);
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

      this.http.post('http://3.85.87.1/api/Image/upload', formData)
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
    this.http.get('http://3.85.87.1/api/Parking/status')
      .subscribe((response: any) => {
        this.plazasLibres = response.availableSpots;
        console.log(response, "response");
        console.log('Plazas libres:', this.plazasLibres);
      }, error => {
        console.error('Error al comprobar las plazas libres', error);
      });
  }

}
