import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, NgZone, OnDestroy } from '@angular/core';
import QrScanner from 'qr-scanner';
import { QrDataService } from '../services/qr-data.service';

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
  private qrDetected: boolean = false; // Bandera para detectar si ya se ha procesado un QR

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
    if (this.qrDetected) {
      return; // Si ya se ha detectado y procesado un QR, no hacer nada
    }
    this.qrDetected = true;
    this.result = result.data;
    console.log('QR Code detected:', this.result);
    this.qrDataService.setQrData(this.result!); // Enviar el resultado al servicio
    this.scanResult.emit(this.result!); // Emitir el resultado para cualquier escucha externa
  }
}
