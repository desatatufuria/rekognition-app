import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntryComponent } from './entry/entry.component';
import { PaymentComponent } from './payment/payment.component';
import { ExitComponent } from './exit/exit.component';
import { PaypalComponent } from './paypal/paypal.component';

const routes: Routes = [
  { path: 'entry', component: EntryComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'exit', component: ExitComponent },
  { path: 'paypal', component: PaypalComponent },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
