import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LicenseUploadComponent } from './license-upload/license-upload.component';
import { ExitParkingComponent } from './exit-parking/exit-parking.component';
import { QrParkingfeeComponent } from './qr-parkingfee/qr-parkingfee.component';

const routes: Routes = [
  { path: 'entry', component: LicenseUploadComponent },
  { path: 'payment', component: QrParkingfeeComponent },
  { path: 'exit', component: ExitParkingComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
