import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import QrScanner from 'qr-scanner';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit {
  @ViewChild('video', { static: true })
  video!: ElementRef<HTMLVideoElement>;
  result: string | null = null;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    this.initializeScanner();
  }

  initializeScanner(): void {
    const videoElement = this.video.nativeElement;
    const qrScanner = new QrScanner(
      videoElement,
      result => this.ngZone.run(() => this.setResult(result)),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    qrScanner.start();
  }

  setResult(result: any): void {
    this.result = result.data;
    console.log('QR Code detected:', this.result);
  }
}
