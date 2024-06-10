import { Component } from '@angular/core';
import { ParkingService } from '../parking.service';

@Component({
  selector: 'app-calculateparkingfee',
  templateUrl: './calculateparkingfee.component.html',
  styleUrls: ['./calculateparkingfee.component.css']
})
export class CalculateparkingfeeComponent {
  licensePlate: string = ''; // Initialize licensePlate property
  data: any;

  constructor(private parkingService: ParkingService) { }

  fetchData() {
    this.parkingService.fetchData(this.licensePlate).subscribe(
      (response) => {
        this.data = response;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
}
