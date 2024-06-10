import { Component } from '@angular/core';
import { ParkingService } from '../parking.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calculateparkingfee',
  templateUrl: './calculateparkingfee.component.html',
  styleUrls: ['./calculateparkingfee.component.css'],
  providers: [DatePipe]
})
export class CalculateparkingfeeComponent {
  licensePlate: string = ''; // Initialize licensePlate property
  data: any;

  constructor(private parkingService: ParkingService, private datePipe: DatePipe) { }

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

  formatTime(dateTime: string): string {
    return this.datePipe.transform(dateTime, 'dd/MM/yyyy HH:mm:ss')!;
  }
}
