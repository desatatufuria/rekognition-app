import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { GarageManagementComponent } from './garage-management/garage-management.component';
import { LicenseUploadComponent } from './license-upload/license-upload.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';
import { CalculateparkingfeeComponent } from './calculateparkingfee/calculateparkingfee.component';
import { FormsModule } from '@angular/forms';
import { ExitParkingComponent } from './exit-parking/exit-parking.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { QrParkingfeeComponent } from './qr-parkingfee/qr-parkingfee.component';
import { EntryComponent } from './entry/entry.component';
import { PaymentComponent } from './payment/payment.component';
import { ExitComponent } from './exit/exit.component';
import { AppComponent } from './app/app.component';
@NgModule({
  declarations: [
    AppComponent,
    GarageManagementComponent,
    LicenseUploadComponent,
    QrScannerComponent,
    CalculateparkingfeeComponent,
    ExitParkingComponent,
    NavMenuComponent,
    QrParkingfeeComponent,
    EntryComponent,
    PaymentComponent,
    ExitComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
