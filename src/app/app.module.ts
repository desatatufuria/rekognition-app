import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { HttpClientModule } from '@angular/common/http';
import { QrcodegeneratorComponent } from './qrcodegenerator/qrcodegenerator.component';
import { Base64ImageComponent } from './base64-image/base64-image.component';
import { GarageManagementComponent } from './garage-management/garage-management.component';
@NgModule({
  declarations: [
    AppComponent,
    ImageUploadComponent,
    QrcodegeneratorComponent,
    Base64ImageComponent,
    GarageManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
