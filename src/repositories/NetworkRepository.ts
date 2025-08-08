import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class NetworkRepository {
  private repo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(NetworkDAO);
  }

  getAllNetworks(): Promise<NetworkDAO[]> {
    return this.repo.find({relations: { gateways: {sensors: true} }});
  }
  
  async createNetwork(
    code: string,
    name: string,
    description: string,
  ): Promise<NetworkDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { code } }),
      () => true,
      `Network with code '${code}' already exists`
    );

    return this.repo.save({
        code: code,
        name: name,
        description: description,
    });
  }

  async getNetworkByNetworkCode(code: string): Promise<NetworkDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { code }, relations: { gateways: {sensors: true} } }),
      () => true,
      `Network with code '${code}' not found`
    );
  }
  async updateNetwork(networkCode: string, code: string, name: string, description: string): Promise<NetworkDAO> {
    let oldNetwork = await findOrThrowNotFound(
      await this.repo.find({ where: { code: networkCode }, relations: { gateways: {sensors: true} } }),
      () => true,
      `Network with code '${networkCode}' not found`
    );
    
    // Check for code conflicts if the code is changing
    if (code !== networkCode) {
      throwConflictIfFound(
        await this.repo.find({ where: { code } }),
        () => true,
        `Network with code '${code}' already exists`
      );
    }
    
    oldNetwork.name = name;
    oldNetwork.description = description;
    if (code !== networkCode) {
      oldNetwork.code = code;
      oldNetwork.gateways.forEach(gateway => {
      gateway.network = oldNetwork;
      });
      await this.repo.save(oldNetwork);
      await this.deleteNetwork(networkCode);
    } else {
      await this.repo.save(oldNetwork);
    }
    
    return this.repo.findOneOrFail({
      where: { code },
      relations: { gateways: { sensors: {measurements: true} } }
    });
  }

  async deleteNetwork(code: string): Promise<void> {
    await this.repo.remove(await this.getNetworkByNetworkCode(code));
  }
}
