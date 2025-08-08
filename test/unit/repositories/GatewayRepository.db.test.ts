import { GatewayRepository } from "@repositories/GatewayRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource,
  
} from "@test/setup/test-datasource";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  jest.resetModules(); 
  await TestDataSource.getRepository(MeasurementDAO).clear?.();
  await TestDataSource.getRepository(SensorDAO).clear?.();
  await TestDataSource.getRepository(GatewayDAO).clear?.();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("GatewayRepository: SQLite in-memory", () => {
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();

  it("create gateway", async () => {
    const networkRepository = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepository = TestDataSource.getRepository(GatewayDAO);

    const network = await networkRepository.save({ code: "NET001", name: "Test Network", description: "Test description" });
    await gatewayRepository.save({ macAddress: "GAT001", name: "Test Gateway", description: "Test description", network });

    // Use your custom repository for custom methods
    const found = await gatewayRepo.getGatewayByMacAddress("GAT001");
    expect(found.macAddress).toBe("GAT001");
  });

  it("find gateway by macAddress: not found", async () => {
    await expect(gatewayRepo.getGatewayByMacAddress("unknown")).rejects.toThrow(
      NotFoundError
    );
  });

  it("create gateway: conflict", async () => {
    await networkRepo.createNetwork("NET001", "Test Network", "Test description");
    await gatewayRepo.createGateway("GAT001", "Test Gateway", "Test description", "NET001");
    await expect(
      gatewayRepo.createGateway("GAT001", "Another name", "Test description", "NET001")
    ).rejects.toThrow(ConflictError);
  });

  it("update gateway", async () => {
    await networkRepo.createNetwork("NET001", "Test Network", "Test description");
    await gatewayRepo.createGateway("GAT001", "Test Gateway", "Test description", "NET001");
    const updatedGateway = await gatewayRepo.updateGateway("GAT001","GAT002", "Updated Gateway", "Updated description", "NET001");
    expect(updatedGateway).toMatchObject({
      macAddress: "GAT002",
      name: "Updated Gateway",
      description: "Updated description",
      network: expect.objectContaining({ code: "NET001" })
    });
    const found = await gatewayRepo.getGatewayByMacAddress("GAT002");
    expect(found.macAddress).toBe("GAT002");
  });


   it("create gateway: network not found", async () => {
    // Non creare la network!
    await expect(
      gatewayRepo.createGateway("GAT001", "Test Gateway", "Test description", "NET404")
    ).rejects.toThrow(NotFoundError);
  });

  it("update gateway: network not found", async () => {
    await networkRepo.createNetwork("NET001", "Test Network", "Test description");
    await gatewayRepo.createGateway("GAT001", "Test Gateway", "Test description", "NET001");
    // Prova ad aggiornare verso una network che non esiste
    await expect(
      gatewayRepo.updateGateway("GAT001", "GAT001", "Test Gateway", "Test description", "NET404")
    ).rejects.toThrow(NotFoundError);
  });

  it("deleteGateway - gateway exists but in different network", async () => {
  const networkRepo = TestDataSource.getRepository(NetworkDAO);
  const gatewayRepoDB = TestDataSource.getRepository(GatewayDAO);
  
  const network1 = await networkRepo.save({ code: "NET_A", name: "Network A", description: "desc" });
  const network2 = await networkRepo.save({ code: "NET_B", name: "Network B", description: "desc" });
  
  await gatewayRepoDB.save({ macAddress: "GAT123", name: "Gateway", description: "desc", network: network1 });
  await expect(gatewayRepo.deleteGateway("GAT123", "NET_B")).rejects.toThrow(`Gateway with MAC address 'GAT123' not found in network 'NET_B'`);
});

});