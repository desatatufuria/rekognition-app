import { Component, OnInit } from '@angular/core';
import { ParkingSpot } from '../interfaces/parking';
import { ParkingHttpService } from '../services/parking-http.service';

@Component({
  selector: 'app-parking-status',
  templateUrl: './parking-status.component.html',
  styleUrls: ['./parking-status.component.css']
})
export class ParkingStatusComponent implements OnInit {

  parkingSpots: ParkingSpot[] = [];

  constructor(private parkingService: ParkingHttpService) { }

  ngOnInit(): void {
    this.loadParkingSpots();
  }

  loadParkingSpots(): void {
    this.parkingService.getParkingSpots().subscribe(spots => {
      this.parkingSpots = spots;
    });
  }
}
