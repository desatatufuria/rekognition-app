import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, NgZone, OnDestroy } from '@angular/core';
import QrScanner from 'qr-scanner';
import { QrDataService } from '../qr-data.service';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  @Output() scanResult = new EventEmitter<string>(); // Emitir evento cuando se detecte un QR
  result: string | null = null;
  qrScanner!: QrScanner;

  constructor(private ngZone: NgZone, private qrDataService: QrDataService) { }

  ngOnInit(): void {
    this.initializeScanner();
  }

  ngOnDestroy(): void {
    this.qrScanner.stop();
  }

  initializeScanner(): void {
    const videoElement = this.video.nativeElement;
    this.qrScanner = new QrScanner(
      videoElement,
      result => this.ngZone.run(() => this.setResult(result)),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    this.qrScanner.start();
  }

  setResult(result: any): void {
    this.result = result.data;
    console.log('QR Code detected:', this.result);
    this.qrDataService.setQrData(this.result!); // Enviar el resultado al servicio
  }
}
