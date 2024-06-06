import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Base64Service {
  constructor() { }

  base64ToBlob(base64: string, contentType: string): Blob {
    const binary = atob(base64.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: contentType });
  }
}
