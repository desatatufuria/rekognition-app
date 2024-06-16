import { Component, OnInit } from '@angular/core';
import { ParkingExit, ParkingSpot } from '../interfaces/parking';
import { ParkingHttpService } from '../services/parking-http.service';

@Component({
  selector: 'app-parking-status',
  templateUrl: './parking-status.component.html',
  styleUrls: ['./parking-status.component.css']
})
export class ParkingStatusComponent implements OnInit {

  parkingSpots: ParkingSpot[] = [];
  vehicles: ParkingExit[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 8;

  showPagination: boolean = false;

  constructor(private parkingService: ParkingHttpService) { }

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
