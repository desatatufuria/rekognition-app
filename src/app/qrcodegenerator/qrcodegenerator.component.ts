import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-qrcodegenerator',
  templateUrl: './qrcodegenerator.component.html',
  styleUrls: ['./qrcodegenerator.component.css']
})
export class QrcodegeneratorComponent implements OnInit {
  vehiculos: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any[]>('http://3.85.87.1/api/Parking/vehicles').subscribe(data => {
      this.vehiculos = data;
    });
  }
}
