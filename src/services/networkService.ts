import { NetworkRepository } from "@repositories/NetworkRepository";
import { Network as NetworkDTO } from "@dto/Network";

const networkRepo = new NetworkRepository();

export async function getAllNetworks(): Promise<NetworkDTO[]> {
  return await networkRepo.getAllNetworks();
}

export async function getNetworkByCode(code: string): Promise<NetworkDTO> {
  return await networkRepo.getNetworkByNetworkCode(code);
}

export async function createNetwork(networkDto: NetworkDTO): Promise<void> {
  await networkRepo.createNetwork(networkDto.code, networkDto.name, networkDto.description);
}

export async function updateNetwork(code: string, updatedData: Partial<NetworkDTO>): Promise<void> {
  await networkRepo.updateNetwork(code, updatedData.code!, updatedData.name!, updatedData.description!);
}

export async function deleteNetwork(code: string): Promise<void> {
  await networkRepo.deleteNetwork(code);
}