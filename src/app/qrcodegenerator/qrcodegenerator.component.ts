import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-qrcodegenerator',
  templateUrl: './qrcodegenerator.component.html',
  styleUrls: ['./qrcodegenerator.component.css']
})
export class QrcodegeneratorComponent implements OnInit {
  vehiculos: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any[]>('http://3.85.87.1/api/Parking/vehicles').subscribe(data => {
      this.vehiculos = data;
    });
  }

  dataURItoBlob(dataURI: string): string {
    if (!dataURI || typeof dataURI !== 'string') {
      return '';
    }

    // Verificar si dataURI comienza con 'data:image/png;base64,'
    const prefix = 'data:image/png;base64,';
    if (!dataURI.startsWith(prefix)) {
      return '';
    }

    // Extraer la parte base64 de la cadena
    const base64String = dataURI.slice(prefix.length);

    // Decodificar la cadena base64
    const byteString = atob(base64String);

    // Crear un array buffer para guardar los bytes de la cadena base64
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    // Llenar el array buffer con los bytes de la cadena base64
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    // Crear un Blob a partir del array buffer
    const blob = new Blob([intArray], { type: 'image/png' });

    // Generar una URL a partir del Blob
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  }
}
