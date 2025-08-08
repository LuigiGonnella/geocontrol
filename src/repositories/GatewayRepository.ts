import { AppDataSource } from "@database";
import { Not, Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";

export class GatewayRepository {
  private repo: Repository<GatewayDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(GatewayDAO);
  }
  async getAllGatewaysforNetwork(networkCode: string): Promise<GatewayDAO[]> {
    // First check if the network exists
    const networkRepo = AppDataSource.getRepository(NetworkDAO);
    const network = await networkRepo.findOne({ where: { code: networkCode } });
    if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);
    
    return this.repo.find({where: {network: { code: networkCode }}, relations: {sensors: true }});
  }
  
 async createGateway(
  macAddress: string,
  name: string,
  description: string,
  networkCode: string,
): Promise<GatewayDAO> {
  throwConflictIfFound(
    await this.repo.find({ where: { macAddress } }),
    () => true,
    `Gateway with MAC address '${macAddress}' already exists`
  );

  // Recupera l'oggetto NetworkDAO dal DB!
  const networkRepo = AppDataSource.getRepository(NetworkDAO);
  const network = await networkRepo.findOne({ where: { code: networkCode } });  if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);

  const gateway = this.repo.create({
    macAddress: macAddress,
    name: name,
    description: description,
    network: network // Passa l'oggetto completo!
  });
  await this.repo.save(gateway);
  return this.repo.findOneOrFail({
    where: { macAddress },
    relations: ["network"]
  });
}
  async getGatewayByMacAddress(macAddress: string): Promise<GatewayDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { macAddress }, relations: { sensors: true, network: true } }),
      () => true,
      `Gateway with MAC address '${macAddress}' not found`
    );
  }
 async updateGateway(
  oldMacAddress: string,
  macAddress: string,
  name: string,
  description: string,
  networkCode: string
): Promise<GatewayDAO> {
  const oldGateway = await findOrThrowNotFound(
    await this.repo.find({ where: { macAddress: oldMacAddress }, relations: { sensors: true } }),
    () => true,
    `Gateway with MAC address '${oldMacAddress}' not found`
  );

  // Check for conflicts if MAC address is being changed
  if (oldMacAddress !== macAddress) {
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Gateway with MAC address '${macAddress}' already exists`
    );
  }

  oldGateway.name = name;
  oldGateway.description = description;

  // Recupera l'oggetto NetworkDAO dal DB!
  const networkRepo = AppDataSource.getRepository(NetworkDAO);
  const network = await networkRepo.findOne({ where: { code: networkCode } });
  if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);
  if (oldMacAddress !== macAddress) {
    oldGateway.macAddress = macAddress;
    oldGateway.network = network; // Usa l'oggetto completo!
    oldGateway.sensors.forEach(sensor => {
      sensor.gateway = oldGateway;
    });
    await this.repo.save(oldGateway);
    // Remove the old gateway entity directly since we already have it
    await this.repo.remove(await this.repo.findOneOrFail({ where: { macAddress: oldMacAddress } }));
  } else {
    oldGateway.network = network; // Usa l'oggetto completo anche qui!
    await this.repo.save(oldGateway);
  }
  return this.repo.findOneOrFail({
    where: { macAddress },
    relations: ["network"]
  });
}
  async deleteGateway(macAddress: string, networkCode: string): Promise<void> {
    // First validate the network exists
    const networkRepo = AppDataSource.getRepository(NetworkDAO);
    const network = await networkRepo.findOne({ where: { code: networkCode } });
    if (!network) throw new NotFoundError(`Network with code '${networkCode}' not found`);
    
    // Get the gateway and validate it belongs to the network
    const gateway = await this.getGatewayByMacAddress(macAddress);
    if (gateway.network?.code !== networkCode) {
      throw new NotFoundError(`Gateway with MAC address '${macAddress}' not found in network '${networkCode}'`);
    }
    
    await this.repo.remove(gateway);
  }
}
