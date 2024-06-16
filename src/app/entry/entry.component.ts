import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { lastValueFrom } from 'rxjs';
// Services
import { CameraService } from '../services/camera.service';
import { LicensePlateService } from '../services/license-plate.service';
import { TicketService } from '../services/ticket.service';
import { ParkingHttpService } from '../services/parking-http.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css'],
  providers: [DatePipe]
})
export class EntryComponent implements AfterViewInit {

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef;
  @ViewChild('ticketDiv') ticketDiv!: ElementRef;

  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  jsonResponse: any = null;
  capturedPhoto: string | null = null;
  capturedTicketImage: string | null = null;
  plazasLibres: number | null = null;
  licensePlate: string | null = null;
  licenseIMG: string | null = null;
  licenseDecode: string | null = null;
  vehicleSpot: string | null = null;
  entryTime: string | null = null;
  ticket: boolean = false;
  ticketVisible: boolean = true;
  private ticketTimeout: any;
  loadingTicket: boolean = false;
  nolicense: boolean = true;
  parkingSpots: boolean = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private cameraService: CameraService,
    private licensePlateService: LicensePlateService,
    private ticketService: TicketService,
    private parkingHttpService: ParkingHttpService
  ) { }

  ngAfterViewInit() {
    this.cameraService.startCamera(this.videoElement);
  }

  onButtonClick() {
    this.captureAndUpload();
  }

  async captureAndUpload() {
    try {
      // Limpiar estado anterior
      this.resetState();

      const capturedPhoto = this.cameraService.captureImage(this.videoElement, this.canvasElement);
      this.loadingTicket = true;

      if (capturedPhoto) {
        const blob = this.cameraService.dataURItoBlob(capturedPhoto);
        const response = await lastValueFrom(this.parkingHttpService.uploadImage(blob));
        this.jsonResponse = response;

        const availableSpots = await this.checkPlazasLibres();
        if (availableSpots > 0) {
          const result = this.licensePlateService.extractLicensePlate(response);
          if (result) {
            this.licensePlate = result.licensePlate;
            this.licenseIMG = result.licenseIMG;
            const registerCarResponse = await this.registerCar();
            this.processRegisterCarResponse(registerCarResponse);
          } else {
            this.handleError('Algo ha salido mal, vuelve a pulsar el botón');
          }
        } else {
          this.handleError('No hay plazas libres, por favor, espere');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      this.handleError('Error al capturar y subir la imagen');
    }
    this.cdr.detectChanges();
    await this.uploadCapturedTicket();
  }

  private resetState() {
    this.loadingTicket = false;
    this.nolicense = true;
    this.parkingSpots = true;
    this.imageUrl = null;
    this.licenseDecode = null;
    this.vehicleSpot = null;
    this.ticket = false;
    this.ticketVisible = false;
  }

  private handleError(message: string) {
    console.log(message);
    this.nolicense = false;
    this.loadingTicket = false;
  }

  private async checkPlazasLibres(): Promise<number> {
    try {
      const response = await lastValueFrom(this.parkingHttpService.checkAvailableSpots());
      return response!.availableSpots;
    } catch (error) {
      console.error('Error al comprobar las plazas libres', error);
      throw error;
    }
  }

  private async registerCar(): Promise<any> {
    try {
      return await lastValueFrom(this.parkingHttpService.registerCar(this.licensePlate, this.licenseIMG));
    } catch (error) {
      console.error('Error al registrar el coche', error);
      throw error;
    }
  }

  private processRegisterCarResponse(response: any) {
    console.log("qrcode:", response.qrCode);
    this.imageUrl = 'data:image/png;base64,' + response.qrCode;
    this.licenseDecode = response.licensePlate;
    this.vehicleSpot = response.parkingSpotId;

    const rawEntryTime = new Date(response.entryTime);
    this.entryTime = this.datePipe.transform(rawEntryTime, 'dd-MM-yyyy / HH:mm:ss');

    this.ticket = true;
    this.loadingTicket = false;
    this.parkingSpots = true;
    this.ticketVisible = true;
  }

  private async uploadCapturedTicket() {
    try {
      const capturedTicketImage = await this.ticketService.captureTicket(this.ticketDiv);
      const response = await lastValueFrom(this.parkingHttpService.uploadCapturedTicketImage(capturedTicketImage));
      console.log('Image uploaded to backend:', response);
      this.hideTicketAfterTimeout();
    } catch (error) {
      console.error('Error uploading image to backend:', error);
    }
  }

  private hideTicketAfterTimeout() {
    if (this.ticketTimeout) {
      clearTimeout(this.ticketTimeout);
    }
    this.ticketTimeout = setTimeout(() => {
      this.ticketVisible = false;
    }, 5000);
  }
}
