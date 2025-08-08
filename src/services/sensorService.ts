import { SensorRepository } from "@repositories/SensorRepository";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { GatewayDAO } from "@models/dao/GatewayDAO";

const sensorRepo = new SensorRepository();

export async function getSensorsByGateway(gatewayMac: string): Promise<SensorDTO[]> {
  return await sensorRepo.getAllSensorsforGateway(gatewayMac);
}

export async function getSensorByMac(macAddress: string): Promise<SensorDTO> {
  return await sensorRepo.getSensorByMacAddress(macAddress);
}

export async function createSensor(gateway: GatewayDAO, sensorDto: SensorDTO): Promise<void> {
  await sensorRepo.createSensor(
    sensorDto.macAddress,
    sensorDto.name,
    sensorDto.description,
    sensorDto.variable,
    sensorDto.unit,
    gateway
  );
}

export async function updateSensor(macAddress: string, gatewayMacAddress: string, updatedData: Partial<SensorDTO>): Promise<void> {
  await sensorRepo.updateSensor(
    macAddress,
    updatedData.macAddress!,
    updatedData.name!,
    updatedData.description!,
    updatedData.variable!,
    updatedData.unit!,
    gatewayMacAddress!
  );
}

export async function deleteSensor(macAddress: string): Promise<void> {
  await sensorRepo.deleteSensor(macAddress);
}