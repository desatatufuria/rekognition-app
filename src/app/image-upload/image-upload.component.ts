import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  jsonResponse: any = null;

  constructor(private http: HttpClient) { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    console.log(this.selectedFile);
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post('http://3.85.87.1/api/Image/upload', formData)
        .subscribe(response => {
          this.jsonResponse = response;
          console.log(this.jsonResponse);
        }, error => {
          console.error('Error:', error);
        });
    }
  }
}
