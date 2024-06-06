import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Base64Service } from '../base64.service';
@Component({
  selector: 'app-base64-image',
  templateUrl: './base64-image.component.html',
  styleUrls: ['./base64-image.component.css']
})
export class Base64ImageComponent implements OnInit {
  @Input() base64String: string = '';
  imageUrl: SafeUrl | undefined;

  constructor(private sanitizer: DomSanitizer, private base64Service: Base64Service) { }

  ngOnInit(): void {
    this.imageUrl = this.createImageFromBase64(this.base64String);
  }

  createImageFromBase64(base64: string): SafeUrl {
    const blob = this.base64Service.base64ToBlob(base64, 'image/png');
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
