import { Gateway as GatewayDTO } from "@dto/Gateway";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NotFoundError } from "@models/errors/NotFoundError";
import { mapGatewayDAOToDTO } from "@services/mapperService";

export async function getGatewaysByNetwork(networkCode: string): Promise<GatewayDTO[]> {
  const gatewayRepo = new GatewayRepository();
  const gateways = await gatewayRepo.getAllGatewaysforNetwork(networkCode);
  
  // Map to DTOs without network and sensors relations
  return gateways.map(gateway => (mapGatewayDAOToDTO(gateway)));
}

export async function getGatewayByMac(macAddress: string, networkCode?: string): Promise<GatewayDTO> {
  const gatewayRepo = new GatewayRepository();
  const gateway = await gatewayRepo.getGatewayByMacAddress(macAddress);
  
  // If networkCode is provided, validate the gateway belongs to that network
  if (networkCode && gateway.network?.code !== networkCode) {
    throw new NotFoundError(`Gateway with MAC address '${macAddress}' not found in network '${networkCode}'`);
  }
  
  // Map to DTO without network relation and without sensors (based on test expectation)
  return mapGatewayDAOToDTO(gateway);
}

export async function createGateway(networkCode: string, gatewayDto: GatewayDTO): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.createGateway(
    gatewayDto.macAddress,
    gatewayDto.name,
    gatewayDto.description,
    networkCode
  );
}

export async function updateGateway(macAddress: string, updatedData: Partial<GatewayDTO>, networkCode: string): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.updateGateway(
    macAddress,
    updatedData.macAddress!,
    updatedData.name!,
    updatedData.description!,
    networkCode
  );
}

export async function deleteGateway(macAddress: string, networkCode: string): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.deleteGateway(macAddress, networkCode);
}