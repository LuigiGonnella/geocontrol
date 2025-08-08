import { Sensor as SensorDTO } from "@dto/Sensor";
import { SensorRepository } from "@repositories/SensorRepository";
import { AppDataSource } from "@database";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { mapSensorDAOToDTO } from "@services/mapperService";

export async function getSensorsByGateway(networkCode: string, gatewayMac: string): Promise<SensorDTO[]> {
  // Validate network exists
  const networkRepo = AppDataSource.getRepository(NetworkDAO);
  const network = await networkRepo.findOneBy({ code: networkCode });
  if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);

  // Validate gateway exists and belongs to network
  const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
  const gateway = await gatewayRepo.findOne({ 
    where: { macAddress: gatewayMac },
    relations: ['network']
  });
  if (!gateway) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found`);
  if (gateway.network.code !== networkCode) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found in network '${networkCode}'`);

  const sensorRepo = new SensorRepository();
  const sensors = await sensorRepo.getAllSensorsforGateway(gatewayMac);
  
  // Map to DTOs without gateway relations
  return sensors.map(sensor => (mapSensorDAOToDTO(sensor)));
}

export async function getSensorByMac(networkCode: string, gatewayMac: string, macAddress: string): Promise<SensorDTO> {
  // Validate network exists
  const networkRepo = AppDataSource.getRepository(NetworkDAO);
  const network = await networkRepo.findOneBy({ code: networkCode });
  if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);

  // Validate gateway exists and belongs to network
  const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
  const gateway = await gatewayRepo.findOne({ 
    where: { macAddress: gatewayMac },
    relations: ['network']
  });
  if (!gateway) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found`);
  if (gateway.network.code !== networkCode) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found in network '${networkCode}'`);

  const sensorRepo = new SensorRepository();
  const sensor = await sensorRepo.getSensorByMacAddress(macAddress);
  
  // Map to DTO without gateway relation
  return mapSensorDAOToDTO(sensor);
}

export async function createSensor(networkCode: string, gatewayMac: string, sensorDto: SensorDTO): Promise<void> {
  // Validate network exists
  const networkRepo = AppDataSource.getRepository(NetworkDAO);
  const network = await networkRepo.findOneBy({ code: networkCode });
  if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);

  // Validate gateway exists and belongs to network
  const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
  const gateway = await gatewayRepo.findOne({ 
    where: { macAddress: gatewayMac },
    relations: ['network']
  });
  if (!gateway) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found`);
  if (gateway.network.code !== networkCode) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found in network '${networkCode}'`);

  const sensorRepo = new SensorRepository();
  await sensorRepo.createSensor(
    sensorDto.macAddress,
    sensorDto.name,
    sensorDto.description,
    sensorDto.variable,
    sensorDto.unit,
    gateway // Passa l'oggetto gateway, non solo il macAddress!
  );
}

export async function updateSensor(networkCode: string, gatewayMac: string, macAddress: string, updatedData: Partial<SensorDTO>): Promise<void> {
  // Validate network exists
  const networkRepo = AppDataSource.getRepository(NetworkDAO);
  const network = await networkRepo.findOneBy({ code: networkCode });
  if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);

  // Validate gateway exists and belongs to network
  const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
  const gateway = await gatewayRepo.findOne({ 
    where: { macAddress: gatewayMac },
    relations: ['network']
  });
  if (!gateway) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found`);
  if (gateway.network.code !== networkCode) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found in network '${networkCode}'`);

  const sensorRepo = new SensorRepository();
  await sensorRepo.updateSensor(
    macAddress,
    updatedData.macAddress!,
    updatedData.name!,
    updatedData.description!,
    updatedData.variable!,
    updatedData.unit!,
    gatewayMac!
  );
}

export async function deleteSensor(networkCode: string, gatewayMac: string, macAddress: string): Promise<void> {
  // Validate network exists
  const networkRepo = AppDataSource.getRepository(NetworkDAO);
  const network = await networkRepo.findOneBy({ code: networkCode });
  if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);

  // Validate gateway exists and belongs to network
  const gatewayRepo = AppDataSource.getRepository(GatewayDAO);
  const gateway = await gatewayRepo.findOne({ 
    where: { macAddress: gatewayMac },
    relations: ['network']
  });
  if (!gateway) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found`);
  if (gateway.network.code !== networkCode) throw new NotFoundError(`Gateway with MAC address '${gatewayMac}' not found in network '${networkCode}'`);

  const sensorRepo = new SensorRepository();
  await sensorRepo.deleteSensor(macAddress);
}