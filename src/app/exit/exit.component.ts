import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { lastValueFrom } from 'rxjs';

// Services
import { CameraService } from '../services/camera.service';
import { LicensePlateService } from '../services/license-plate.service';
import { ParkingHttpService } from '../services/parking-http.service';

// Interfaces
import { ParkingExit } from '../interfaces/parking';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.css'],

})
export class ExitComponent implements AfterViewInit {
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  jsonResponse: any = null;
  errorMessage: string | null = null;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef;
  capturedPhoto: string | null = null;

  licensePlate: string | null = null;
  licenseIMG: string | null = null;

  nolicense: boolean = false;
  carExit: boolean = false;
  readingLicense: boolean = false;

  url: string = "http://3.85.87.1";
  url1: string = "https://localhost:7130";

  constructor(
    private cameraService: CameraService,
    private licensePlateService: LicensePlateService,

    private parkingHttpService: ParkingHttpService
  ) { }

  ngAfterViewInit() {
    this.cameraService.startCamera(this.videoElement);
  }

  async startAutoCapture() {
    await this.captureAndUpload();
  }

  async captureAndUpload() {
    try {
      // Limpiar estado anterior
      this.resetState();

      const capturedPhoto = this.cameraService.captureImage(this.videoElement, this.canvasElement);


      this.readingLicense = true;
      if (capturedPhoto) {
        const blob = this.cameraService.dataURItoBlob(capturedPhoto);
        const response = await lastValueFrom(this.parkingHttpService.uploadImage(blob));
        this.jsonResponse = response;

        const result = this.licensePlateService.extractLicensePlate(response);
        if (result) {
          this.licensePlate = result.licensePlate;
          this.licenseIMG = result.licenseIMG;
          const registerCarResponse = await this.registerCarExit();
          console.log("Hora de salida registrada:", registerCarResponse.exitTime);
          this.carExit = true;
          this.readingLicense = false;
          setTimeout(() => {
            this.carExit = false;
          }, 5000);
        } else {
          console.log("Algo ha salido mal, vuelve a pulsar el botón");
          this.nolicense = true;
          this.readingLicense = false;
          setTimeout(() => {
            this.nolicense = false;
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      this.readingLicense = false;
     // this.nolicense = true;
      setTimeout(() => {
        this.resetState();
      }, 5000);
    }
  }

  async registerCarExit(): Promise<ParkingExit> {
    console.log('Registrando salida del vehículo...');

    // Decode licensePlate
    this.licensePlate = atob(this.licensePlate || '');
    this.licensePlate = this.licensePlate.split(';')[0];
    console.log(this.licensePlate, "licensePlate");

    const carData = { licensePlate: this.licensePlate };

    try {
      console.log('lo que viene ahora es response----');
      const response = await lastValueFrom(this.parkingHttpService.registerCarExit(carData));
      console.log('Salida del vehículo registrada correctamente:', response);
      console.log('fin de response----');
      return response;
    } catch (error: any) {
      console.error('Error al registrar la salida del vehículo:', error);
      this.errorMessage = error?.error?.error || 'Unknown error';
      throw error;
    }
  }

  private resetState() {
    this.readingLicense = false;
    this.nolicense = false;
    this.carExit = false;
    this.imageUrl = null;
    this.errorMessage = null;

  }
}
