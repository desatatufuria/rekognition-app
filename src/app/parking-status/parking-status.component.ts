import { Component, OnInit } from '@angular/core';
import { ParkingExit, ParkingSpot } from '../interfaces/parking';
import { ParkingHttpService } from '../services/parking-http.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-parking-status',
  templateUrl: './parking-status.component.html',
  styleUrls: ['./parking-status.component.css'],
  providers: [DatePipe]
})
export class ParkingStatusComponent implements OnInit {

  parkingSpots: ParkingSpot[] = [];
  vehicles: ParkingExit[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 8;

  showPagination: boolean = false;

  // Para controlar el estado de la imagen por cada plaza
  imagePopovers: { [key: string]: boolean } = {};


  constructor(private parkingService: ParkingHttpService,  private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.loadParkingSpots();
    this.loadVehicles();
    this.loadParkingData();

  }

  loadParkingSpots(): void {
    this.parkingService.getParkingSpots().subscribe(spots => {
      this.parkingSpots = spots;
    });
  }

  loadVehicles(): void {
    this.parkingService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
    });
  }

  getLicensePlate(spotId: number): string | null {
    const vehicle = this.vehicles.find(v => v.parkingSpotId === spotId && !v.exitTime);
    return vehicle ? vehicle.licensePlate : null;
  }

  getEntryTime(spotId: number): string | null {
    const vehicle = this.vehicles.find(v => v.parkingSpotId === spotId && !v.exitTime);
    return vehicle ? vehicle.entryTime : null;
  }

  getAdjustedEntryTime(spotId: number): Date | null {
    const entryTime = this.getEntryTime(spotId);
    if (entryTime) {
      const adjustedEntryTime = new Date(entryTime);
      adjustedEntryTime.setHours(adjustedEntryTime.getHours() + 2);
      return adjustedEntryTime;
    }
    return null;
  }

  getFormattedEntryTime(spotId: number): string | null {
    const adjustedEntryTime = this.getAdjustedEntryTime(spotId);
    return adjustedEntryTime ? this.datePipe.transform(adjustedEntryTime, 'dd/MM/yyyy HH:mm:ss') : null;
  }

  getParkingDuration(spotId: number): { days: number, hours: number, minutes: number, seconds: number } | null {
    const vehicle = this.vehicles.find(v => v.parkingSpotId === spotId && !v.exitTime);
    if (vehicle) {
      const currentTime = new Date();
      const entryTime = new Date(vehicle.entryTime);
      const durationInSeconds = (currentTime.getTime() - entryTime.getTime()) / 1000; // Duration in seconds
      const adjustedDurationInSeconds = durationInSeconds - (120 * 60); // Subtract 120 minutes (2 hours) in seconds

      const days = Math.floor(adjustedDurationInSeconds / (24 * 60 * 60));
      const hours = Math.floor((adjustedDurationInSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((adjustedDurationInSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(adjustedDurationInSeconds % 60);

      return { days, hours, minutes, seconds };
    }
    return null;
  }

  getFormattedParkingDuration(spotId: number): string | null {
    const duration = this.getParkingDuration(spotId);
    if (duration) {
      const parts = [];
      if (duration.days > 0) {
        parts.push(`${duration.days} días`);
      }
      if (duration.hours > 0) {
        parts.push(`${duration.hours} horas`);
      }
      if (duration.minutes > 0 || duration.seconds > 0 || parts.length === 0) {
        parts.push(`${duration.minutes} minutos y ${duration.seconds} segundos`);
      }
      return parts.join(', ');
    }
    return null;
  }

  getAmount(spotId: number): number | null {
    const duration = this.getParkingDuration(spotId);
    if (duration) {
      const totalMinutes = (duration.days * 24 * 60) + (duration.hours * 60) + duration.minutes + duration.seconds / 60;
      const amount = totalMinutes * 0.05;
      return parseFloat(amount.toFixed(2));
    }
    return null;
  }

  getLicenseIMG(spotId: number): string | null {
    const vehicle = this.vehicles.find(v => v.parkingSpotId === spotId && !v.exitTime);
    return vehicle ? vehicle.licenseIMG : null;
  }

  // Método para cambiar el estado de visibilidad de la imagen
  toggleImagePopover(spotId: number): void {
    // Cerrar todas las imágenes abiertas excepto la que se está abriendo
    Object.keys(this.imagePopovers).forEach(key => {
      if (Number(key) !== spotId) {
        this.imagePopovers[key] = false;
      }
    });

    // Cambiar el estado de la imagen del lugar de estacionamiento actual
    this.imagePopovers[spotId] = !this.imagePopovers[spotId];
  }


  loadParkingData(): void {
    this.parkingService.getParkingDataEveryFiveSeconds().subscribe(spots => {
      this.loadParkingSpots();
      this.loadVehicles();
      this.showPagination = this.parkingSpots.length > this.itemsPerPage;
      //setTimeout(() => { }, 0);
    });
  }

  getDisplayedSpots(): ParkingSpot[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.parkingSpots.filter(spot => spot.isOccupied).slice(startIndex, endIndex);
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  getPaginationArray(): number[] {
    const occupiedSpotsCount = this.parkingSpots.filter(spot => spot.isOccupied).length;
    const pageCount = Math.ceil(occupiedSpotsCount / this.itemsPerPage);
    return Array(pageCount).fill(0).map((x, i) => i + 1);
  }


}
