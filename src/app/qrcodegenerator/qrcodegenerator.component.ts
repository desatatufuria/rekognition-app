import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Base64Service } from '../base64.service';

@Component({
  selector: 'app-qrcodegenerator',
  templateUrl: './qrcodegenerator.component.html',
  styleUrls: ['./qrcodegenerator.component.css']
})
export class QrcodegeneratorComponent implements OnInit {
  vehiculos: any[] = [];
  @Input() base64String: string = '';
  imageUrl: SafeUrl | undefined;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private base64Service: Base64Service) { }

  ngOnInit(): void {
    this.http.get<any[]>('http://3.85.87.1/api/Parking/vehicles').subscribe(data => {
      this.vehiculos = data;
    // console.log(this.vehiculos[0].qrCode);
      this.imageUrl = this.createImageFromBase64("'data:image/png;base64,"+this.vehiculos[0].qrCode);
    });
  }

  createImageFromBase64(base64: string): SafeUrl {
    const blob = this.base64Service.base64ToBlob(base64, 'image/png');
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}

