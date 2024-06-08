import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseUploadComponent } from './license-upload.component';

describe('LicenseUploadComponent', () => {
  let component: LicenseUploadComponent;
  let fixture: ComponentFixture<LicenseUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LicenseUploadComponent]
    });
    fixture = TestBed.createComponent(LicenseUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
