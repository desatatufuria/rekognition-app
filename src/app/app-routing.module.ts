import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntryComponent } from './entry/entry.component';
import { PaymentComponent } from './payment/payment.component';
import { ExitComponent } from './exit/exit.component';
import { ParkingStatusComponent } from './parking-status/parking-status.component';
import { GarageManagementComponent } from './garage-management/garage-management.component';

const routes: Routes = [
  { path: 'entry', component: EntryComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'exit', component: ExitComponent },
  { path: 'status', component: ParkingStatusComponent },
  { path: 'garagem', component: GarageManagementComponent },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
