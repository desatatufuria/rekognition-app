import { TestBed } from '@angular/core/testing';

import { QrDataService } from './qr-data.service';

describe('QrDataService', () => {
  let service: QrDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
