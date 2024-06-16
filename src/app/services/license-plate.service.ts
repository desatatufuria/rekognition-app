import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LicensePlateService {

  extractLicensePlate(response: any): { licensePlate: string, licenseIMG: string } | null {
    const textDetections = response.textDetections.map((encodedText: string) => atob(encodedText));

    if (textDetections && textDetections.length > 0) {
      const normalizeText = (text: string) => text.replace(/\s/g, ' ');

      const licensePlateCandidates = textDetections.filter((text: string) => {
        const normalizedText = normalizeText(text);
        const platePattern = /^\d{4} [A-Z]{3}$/;
        const fullPattern = /^\d{4} [A-Z]{3} \(\d{1,3}[.,]\d{2}%\)$/;
        return platePattern.test(normalizedText) || fullPattern.test(normalizedText);
      });

      if (licensePlateCandidates.length > 0) {
        const matchedPlate = licensePlateCandidates[0];
        const matchedParts = matchedPlate.match(/^(\d{4} [A-Z]{3})( \((\d{1,3}[.,]\d{2})%\))?$/);

        if (matchedParts) {
          const plate = matchedParts[1].replace(' ', '');
          const result = `${plate};${matchedParts[3]}`;
          return { licensePlate: btoa(result), licenseIMG: response.fileUrl };
        }
      }
    }
    return null;
  }
}
