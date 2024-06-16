import { Pipe, PipeTransform } from '@angular/core';
import { ParkingSpot } from '../interfaces/parking';

@Pipe({
  name: 'occupiedSpots'
})
export class OccupiedSpotsPipe implements PipeTransform {
  transform(spots: ParkingSpot[]): ParkingSpot[] {
    return spots.filter(spot => spot.isOccupied);
  }
}
