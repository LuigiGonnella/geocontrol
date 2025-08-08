import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { findOrThrowNotFound } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
  }

  async createMeasurement(sensorMac: string, value: number, createdAt: Date): Promise<MeasurementDAO> {
    const sensorRepo = AppDataSource.getRepository(SensorDAO);
    const sensor = await findOrThrowNotFound(
      [await sensorRepo.findOne({ where: { macAddress: sensorMac } })],
      (result) => result !== null && result[0] !== null,
      `Sensor with MAC address '${sensorMac}' not found`
    );

    const measurement = this.repo.create({ value, createdAt, sensor });
    return this.repo.save(measurement);
  }

  async getMeasurements(sensorMac: string, startDate?: Date, endDate?: Date): Promise<MeasurementDAO[]> {
    const query = this.repo
      .createQueryBuilder("measurement")
      .innerJoinAndSelect("measurement.sensor", "sensor")
      .where("sensor.macAddress = :sensorMac", { sensorMac });

    if (startDate) query.andWhere("measurement.createdAt >= :startDate", { startDate });
    if (endDate) query.andWhere("measurement.createdAt <= :endDate", { endDate });

    return query.getMany();
  }

  async getStatistics(sensorMac: string, startDate?: Date, endDate?: Date) {
    const measurements = await this.getMeasurements(sensorMac, startDate, endDate);
    const values = measurements.map((m) => m.value);

    if (values.length === 0) {
      // throw new NotFoundError("No measurements found for the specified sensor.");
            // Return default stats when no measurements found instead of throwing error
      return {
        mean: 0,
        variance: 0,
        upperThreshold: 0,
        lowerThreshold: 0,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined
      };
    }

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const upperThreshold = mean + 2 * std;
    const lowerThreshold = mean - 2 * std;

    return {
      mean,
      variance,
      upperThreshold,
      lowerThreshold,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    };
  }


  async getOutliers(sensorMac: string, startDate?: Date, endDate?: Date): Promise<MeasurementDAO[]> {
    const stats = await this.getStatistics(sensorMac, startDate, endDate);
    const measurements = await this.getMeasurements(sensorMac, startDate, endDate);

    return measurements.filter(
      (m) => m.value > stats.mean + 2 * Math.sqrt(stats.variance) || m.value < stats.mean - 2 * Math.sqrt(stats.variance)
    );
  }

  async getMeasurementsByNetwork(networkCode: string, startDate?: Date, endDate?: Date): Promise<MeasurementDAO[]> {
    const query = this.repo
      .createQueryBuilder("measurement")
      .innerJoinAndSelect("measurement.sensor", "sensor")
      .innerJoinAndSelect("sensor.gateway", "gateway")
      .innerJoinAndSelect("gateway.network", "network")
      .where("network.code = :networkCode", { networkCode });

    if (startDate) query.andWhere("measurement.createdAt >= :startDate", { startDate });
    if (endDate) query.andWhere("measurement.createdAt <= :endDate", { endDate });

    return query.getMany();
  }

  async getStatisticsByNetwork(networkCode: string, startDate?: Date, endDate?: Date) {
    const measurements = await this.getMeasurementsByNetwork(networkCode, startDate, endDate);
    const values = measurements.map((m) => m.value);

    if (values.length === 0) {
      // throw new NotFoundError("No measurements found for the specified network.");
            // Return default stats when no measurements found instead of throwing error
      return {
        mean: 0,
        variance: 0,
        upperThreshold: 0,
        lowerThreshold: 0,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined
      };
    }

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    console.log("Mean:", mean);
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const upperThreshold = mean + 2 * std;
    const lowerThreshold = mean - 2 * std;

    return {
      mean,
      variance,
      upperThreshold,
      lowerThreshold,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    };
  }


  async getOutliersByNetwork(networkCode: string, startDate?: Date, endDate?: Date): Promise<MeasurementDAO[]> {
    const stats = await this.getStatisticsByNetwork(networkCode, startDate, endDate);
    const measurements = await this.getMeasurementsByNetwork(networkCode, startDate, endDate);

    return measurements.filter(
      (m) => m.value > stats.mean + 2 * Math.sqrt(stats.variance) || m.value < stats.mean - 2 * Math.sqrt(stats.variance)
    );
  }
}
