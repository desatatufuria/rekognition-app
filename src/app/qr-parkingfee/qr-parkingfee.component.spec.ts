import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrParkingfeeComponent } from './qr-parkingfee.component';

describe('QrParkingfeeComponent', () => {
  let component: QrParkingfeeComponent;
  let fixture: ComponentFixture<QrParkingfeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QrParkingfeeComponent]
    });
    fixture = TestBed.createComponent(QrParkingfeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
