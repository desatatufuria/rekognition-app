import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-licensedetector',
  templateUrl: './licensedetector.component.html',
  styleUrls: ['./licensedetector.component.css']
})
export class LicensedetectorComponent {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef;
  photo: string | null = null;

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
        console.error("Error accessing the camera: ", err);
      });
  }

  capture() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.photo = canvas.toDataURL('image/png');
  }


  uploadPhoto() {
    if (this.photo) {
      const blob = this.dataURItoBlob(this.photo);
      const formData = new FormData();
      formData.append('file', blob, 'photo.png');

      this.http.post('TU_ENDPOINT', formData)
        .subscribe(response => {
          console.log('Foto subida correctamente', response);
        }, error => {
          console.error('Error al subir la foto', error);
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

}
