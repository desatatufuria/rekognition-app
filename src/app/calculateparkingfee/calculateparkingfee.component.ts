import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ParkingService } from '../services/parking.service';
import { QrDataService } from '../services/qr-data.service';

@Component({
  selector: 'app-calculateparkingfee',
  templateUrl: './calculateparkingfee.component.html',
  styleUrls: ['./calculateparkingfee.component.css'],
  providers: [DatePipe]
})
export class CalculateparkingfeeComponent implements OnInit {
  licensePlate: string = ''; // Initialize licensePlate property
  data: any;

  constructor(private parkingService: ParkingService, private datePipe: DatePipe, private qrDataService: QrDataService) { }

  ngOnInit() {
    // Suscribirse a los cambios en los datos del QR
    this.qrDataService.qrData$.subscribe(data => {
      if (data) {
        this.licensePlate = data;
        this.fetchData();
      }
    });
  }

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
