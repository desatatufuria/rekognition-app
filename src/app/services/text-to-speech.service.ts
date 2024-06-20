import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  private baseUrl1: string = 'https://localhost:7130';
  private baseUrl: string = 'http://3.85.87.1';
  private apiUrl = this.baseUrl+'/api/TextToSpeech/convert';

  constructor(private http: HttpClient) { }

  convertTextToSpeech(text: string): Observable<Blob> {
    const payload = { text: text };
    return this.http.post(this.apiUrl, payload, { responseType: 'blob' });
  }
}
