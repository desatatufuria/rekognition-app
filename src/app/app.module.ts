import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { GarageManagementComponent } from './garage-management/garage-management.component';
import { FormsModule } from '@angular/forms';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { EntryComponent } from './entry/entry.component';
import { PaymentComponent } from './payment/payment.component';
import { ExitComponent } from './exit/exit.component';
import { AppComponent } from './app/app.component';
import { PaypalComponent } from './paypal/paypal.component';
@NgModule({
  declarations: [
    AppComponent,
    GarageManagementComponent,
    NavMenuComponent,
    EntryComponent,
    PaymentComponent,
    ExitComponent,
    PaypalComponent
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
