import { MeasurementRepository } from "@repositories/MeasurementRepository";

export class MeasurementService {
  private measurementRepo: MeasurementRepository;

  constructor(measurementRepo?: MeasurementRepository) {
  this.measurementRepo = measurementRepo ?? new MeasurementRepository();
}

  createMeasurement(sensorMac: string, value: number, createdAt: Date) {
    return this.measurementRepo.createMeasurement(sensorMac, value, createdAt);
  }

  getMeasurements(sensorMac: string, startDate?: Date, endDate?: Date) {
    return this.measurementRepo.getMeasurements(sensorMac, startDate, endDate);
  }

  getStatistics(sensorMac: string, startDate?: Date, endDate?: Date) {
    return this.measurementRepo.getStatistics(sensorMac, startDate, endDate);
  }

  getOutliers(sensorMac: string, startDate?: Date, endDate?: Date) {
    return this.measurementRepo.getOutliers(sensorMac, startDate, endDate);
  }

  getMeasurementsByNetwork(networkCode: string, startDate?: Date, endDate?: Date) {
    return this.measurementRepo.getMeasurementsByNetwork(networkCode, startDate, endDate);
  }

  getStatisticsByNetwork(networkCode: string, startDate?: Date, endDate?: Date) {
    return this.measurementRepo.getStatisticsByNetwork(networkCode, startDate, endDate);
  }

  getOutliersByNetwork(networkCode: string, startDate?: Date, endDate?: Date) {
    return this.measurementRepo.getOutliersByNetwork(networkCode, startDate, endDate);
  }
}