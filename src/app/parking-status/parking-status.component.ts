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

  getFormattedEntryTime(spotId: number): string | null {
    const entryTime = this.getEntryTime(spotId);
    return entryTime ? this.datePipe.transform(entryTime, 'dd/MM/yyyy HH:mm:ss') : null;
  }

  getParkingDuration(spotId: number): number | null {
    const vehicle = this.vehicles.find(v => v.parkingSpotId === spotId && !v.exitTime);
    return vehicle ? vehicle.parkingDuration : null;
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
      setTimeout(() => { }, 0);
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
