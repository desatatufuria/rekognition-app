import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitParkingComponent } from './exit-parking.component';

describe('ExitParkingComponent', () => {
  let component: ExitParkingComponent;
  let fixture: ComponentFixture<ExitParkingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExitParkingComponent]
    });
    fixture = TestBed.createComponent(ExitParkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
