import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicensedetectorComponent } from './licensedetector.component';

describe('LicensedetectorComponent', () => {
  let component: LicensedetectorComponent;
  let fixture: ComponentFixture<LicensedetectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LicensedetectorComponent]
    });
    fixture = TestBed.createComponent(LicensedetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
