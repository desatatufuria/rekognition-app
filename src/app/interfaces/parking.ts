

export interface ParkingExit {
  id: number;
  licensePlate: string;
  entryTime: string;
  exitTime: string;
  parkingSpotId: number;
  parkingSpot: ParkingSpot;
  qrCode: string;
  parkingDuration: number;
  amount: number;
  iaPercentage: number;
  licenseIMG: string;
}

interface ParkingSpot {
  id: number;
  isOccupied: boolean;
}
