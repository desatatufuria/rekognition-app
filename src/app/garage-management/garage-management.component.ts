import { Component } from '@angular/core';

interface ParkingSpot {

  id: number;

  occupied: boolean;

}

interface Car {

  licensePlate: string;

  model: string;

  owner: string;

}

interface ParkingSpot {

  id: number;

  occupied: boolean;

  car?: Car;

}

@Component({

  selector: 'app-garage-management',

  templateUrl: './garage-management.component.html',

  styleUrls: ['./garage-management.component.css']

})

export class GarageManagementComponent {

  parkingSpots: ParkingSpot[] = [];

  constructor() {

    for (let i = 0; i < 8; i++) {

      this.parkingSpots.push({ id: i, occupied: false });

    }

  }

  // Método para ocupar una plaza con un coche

  occupySpot(spot: ParkingSpot, car: Car) {

    spot.occupied = true;

    spot.car = car;

  }

  // Método para liberar una plaza

  freeSpot(spot: ParkingSpot) {

    spot.occupied = false;

    spot.car = undefined;

  }

  // Método para obtener datos ficticios del coche

  getDummyCar(spotId: number): Car {

    return {

      licensePlate: `ABC-${1000 + spotId}`,

      model: `Modelo ${spotId + 1}`,

      owner: `Propietario ${spotId + 1}`

    };

  }

}
