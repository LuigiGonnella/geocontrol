import { GatewayRepository } from "@repositories/GatewayRepository";
import { Gateway as GatewayDTO } from "@dto/Gateway";

const gatewayRepo = new GatewayRepository();

export async function getGatewaysByNetwork(networkCode: string): Promise<GatewayDTO[]> {
  return await gatewayRepo.getAllGatewaysforNetwork(networkCode);
}

export async function getGatewayByMac(macAddress: string): Promise<GatewayDTO> {
  return await gatewayRepo.getGatewayByMacAddress(macAddress);
}

export async function createGateway(networkCode: string, gatewayDto: GatewayDTO): Promise<void> {
  await gatewayRepo.createGateway(
    gatewayDto.macAddress,
    gatewayDto.name,
    gatewayDto.description,
    networkCode
  );
}

export async function updateGateway(macAddress: string, updatedData: Partial<GatewayDTO & { network?: { code: string } }>): Promise<void> {
  if (updatedData.network?.code) {
    await gatewayRepo.updateGateway(
      macAddress,
      updatedData.macAddress ?? null,
      updatedData.name ?? null,
      updatedData.description ?? null,
      updatedData.network.code
    );
  } else {
    throw new Error("Network code is required to update the gateway.");
  }
}

export async function deleteGateway(macAddress: string): Promise<void> {
  await gatewayRepo.deleteGateway(macAddress);
}