import { SensorRepository } from "@repositories/SensorRepository";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO"; 
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { TestDataSource, closeTestDataSource, initializeTestDataSource } from "@test/setup/test-datasource";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("SensorRepository (db)", () => {
  let repo: SensorRepository;

  beforeAll(async () => {
    await initializeTestDataSource();
    repo = new SensorRepository();
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  beforeEach(async () => {
    jest.resetModules();
    await TestDataSource.getRepository(MeasurementDAO).clear?.();
    await TestDataSource.getRepository(SensorDAO).clear?.();
    await TestDataSource.getRepository(GatewayDAO).clear?.();
    await TestDataSource.getRepository(NetworkDAO).clear?.();
  });

  it("create, get, update, delete sensor", async () => {
    // Prima crea la rete
    const network = await TestDataSource.getRepository(NetworkDAO).save({ code: "N", name: "Net", description: "desc" });
    // Poi il gateway associato
    const gateway = await TestDataSource.getRepository(GatewayDAO).save({ macAddress: "G", name: "Gateway", description: "desc", network });
    // Poi il sensore associato
    await TestDataSource.getRepository(SensorDAO).save({ macAddress: "S", name: "Sens", description: "desc", variable: "V", unit: "U", gateway });
    // // Create
    // const created = await repo.createSensor("A", "N", "D", "V", "U", gateway);
    // expect(created.macAddress).toBe("A");

    // Get
    const found = await repo.getSensorByMacAddress("S");
    expect(found.macAddress).toBe("S");

    // Update
    const updated = await repo.updateSensor("S", "B", "N", "D2", "V2", "U2", "G");
    expect(updated.macAddress).toBe("B");

    // Delete
    await repo.deleteSensor("B");
    await expect(repo.getSensorByMacAddress("B")).rejects.toThrow();
  });

  it("getAllSensorsforGateway - gateway not found", async () => {
    await expect(repo.getAllSensorsforGateway("gateway not found")).rejects.toThrow(NotFoundError);
  });
  

  it("createSensor - conflict", async () => {
    // Crea la rete prima del gateway
    const network = await TestDataSource.getRepository(NetworkDAO).save({
      code: "N",
      name: "Network N",
      description: "Test network"
    });
    // Crea il gateway associato alla rete (passa l'oggetto network)
    const gateway = await TestDataSource.getRepository(GatewayDAO).save({
      macAddress: "G",
      name: "Gateway G",
      description: "Test gateway",
      network: network
    });

    await repo.createSensor("A", "N", "D", "V", "U", gateway);
    await expect(repo.createSensor("A", "N", "D", "V", "U", gateway)).rejects.toThrow();
  });

  it("getSensorByMacAddress - not found", async () => {
    await expect(repo.getSensorByMacAddress("Z")).rejects.toThrow();
  });

  it("updateSensor - not found", async () => {
    await expect(repo.updateSensor("Z", "B", "N", "D", "V", "U", "G")).rejects.toThrow();
  });

  it("deleteSensor - not found", async () => {
    await expect(repo.deleteSensor("Z")).rejects.toThrow();
  });
});