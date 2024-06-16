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

  constructor(private parkingService: ParkingHttpService) { }

  ngOnInit(): void {
    this.loadParkingSpots();
    this.loadVehicles();
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
}
