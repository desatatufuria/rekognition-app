import { Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ParkingService } from '../services/parking.service';
import { QrDataService } from '../services/qr-data.service';
import QrScanner from 'qr-scanner';
import { HttpClient } from '@angular/common/http';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.css']
})
export class PaypalComponent {

}
