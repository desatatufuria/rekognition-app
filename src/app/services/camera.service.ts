import { Injectable, ElementRef } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class CameraService {

  startCamera(videoElement: ElementRef<HTMLVideoElement>): Promise<void> {
    return navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoElement.nativeElement.srcObject = stream;
      videoElement.nativeElement.play();
    }).catch(err => {
      console.error("Error accessing the camera", err);
      throw err;
    });
  }

  captureImage(videoElement: ElementRef<HTMLVideoElement>, canvasElement: ElementRef<HTMLCanvasElement>): string {
    const video = videoElement.nativeElement;
    const canvas = canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context!.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    return canvas.toDataURL('image/png');
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  }
}
