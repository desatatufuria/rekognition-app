import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateparkingfeeComponent } from './calculateparkingfee.component';

describe('CalculateparkingfeeComponent', () => {
  let component: CalculateparkingfeeComponent;
  let fixture: ComponentFixture<CalculateparkingfeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculateparkingfeeComponent]
    });
    fixture = TestBed.createComponent(CalculateparkingfeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
