import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";

export class SensorRepository {
  private repo: Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
  }
  async getAllSensorsforGateway(macAddress: string): Promise<SensorDAO[]> {
    // First check if the gateway exists
    const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    const gateway = await gatewayRepo.findOne({ where: { macAddress } });
    if (!gateway) throw new NotFoundError(`Gateway with MAC address '${macAddress}' not found`);
    
    return this.repo.find({ where: { gateway: { macAddress: macAddress } } });
  }

  async createSensor(
    macAddress: string,
    name: string,
    description: string,
    variable: string,
    unit: string,
    gateway: GatewayDAO // Cambiato: ora riceve l'oggetto GatewayDAO
  ): Promise<SensorDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Sensor with MAC address '${macAddress}' already exists`
    );
    const sensor = this.repo.create({
      macAddress: macAddress,
      name: name,
      description: description,
      variable: variable,
      unit: unit,
      gateway: gateway // Usa direttamente l'oggetto gateway
    });
    return this.repo.save(sensor);
  }

  async getSensorByMacAddress(macAddress: string): Promise<SensorDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Sensor with MAC address '${macAddress}' not found`
    );
  }
  async updateSensor(
    oldMacAddress: string,
    macAddress: string,
    name: string,
    description: string,
    variable: string,
    unit: string,
    gatewayMacAddress: string
  ): Promise<SensorDAO> {
    const oldSensor = await findOrThrowNotFound(
      await this.repo.find({ where: { macAddress: oldMacAddress }, relations: { measurements: true } }),
      () => true,
      `Sensor with MAC address '${oldMacAddress}' not found`
    );
    
    // Check for conflicts if MAC address is being changed
    if (oldMacAddress !== macAddress) {
      throwConflictIfFound(
        await this.repo.find({ where: { macAddress } }),
        () => true,
        `Sensor with MAC address '${macAddress}' already exists`
      );
    }
    
    oldSensor.name = name;
    oldSensor.description = description;
    oldSensor.variable = variable;
    oldSensor.unit = unit;
    
    const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    const oldGateway = await gatewayRepo.findOne({ where: { macAddress: gatewayMacAddress } });
    if (!oldGateway) throw new NotFoundError(`Gateway with MAC address '${gatewayMacAddress}' not found`);
    if (oldMacAddress !== macAddress) {
      oldSensor.macAddress = macAddress;
      oldSensor.gateway = oldGateway;
      oldSensor.measurements.forEach(measurement => {
        measurement.sensor = oldSensor;
      }); 
      await this.repo.save(oldSensor);
      await this.repo.remove(await this.repo.findOne({ where: { macAddress: oldMacAddress } }));
    } else {
      oldSensor.gateway = oldGateway;
      await this.repo.save(oldSensor);
    }
    return this.repo.findOneOrFail({
      where: { macAddress },
      relations: { measurements: true }
    });
  }

  async deleteSensor(macAddress: string): Promise<void> {
    await this.repo.remove(await this.getSensorByMacAddress(macAddress));
  }
}