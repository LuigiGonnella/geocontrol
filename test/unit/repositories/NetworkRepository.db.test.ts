import { NetworkRepository } from "@repositories/NetworkRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
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

describe("NetworkRepository: SQLite in-memory", () => {
  const repo = new NetworkRepository();

  it("create network", async () => {
    const network = await repo.createNetwork("NET001", "Test Network", "Test description");
    expect(network).toMatchObject({
      code: "NET001",
      name: "Test Network",
      description: "Test description"
    });

    const found = await repo.getNetworkByNetworkCode("NET001");
    expect(found.code).toBe("NET001");
  });

  it("find network by code: not found", async () => {
    await expect(repo.getNetworkByNetworkCode("unknown")).rejects.toThrow(
      NotFoundError
    );
  });

  it("create network: conflict", async () => {
    await repo.createNetwork("NET001", "Test Network", "Test description");
    await expect(
      repo.createNetwork("NET001", "Another name", "Test description")
    ).rejects.toThrow(ConflictError);
  });
  
  it("update network", async () => {
    const oldNetwork = await repo.createNetwork("NET001", "Test Network", "Test description");
    const updatedNetwork = await repo.updateNetwork("NET001","NET002", "Updated Network", "Updated description");
    expect(updatedNetwork).toMatchObject({
      code: "NET002",
      name: "Updated Network",
      description: "Updated description"
    });
    const found = await repo.getNetworkByNetworkCode("NET002");
    expect(found.code).toBe("NET002");

  });
  it ("update network: not found", async () => {
    await expect(repo.updateNetwork("unknown", "NET002", "Updated Network", "Updated description")).rejects.toThrow(
      NotFoundError
    );
  });

  it("getAllNetworks", async () => {
    await repo.createNetwork("NET001", "Test Network", "Test description");
    await repo.createNetwork("NET002", "Test Network2", "Test description2");
    const all = await repo.getAllNetworks();
    expect(all.length).toBe(2);
    expect(all.map(n => n.code)).toContain("NET001");
    expect(all.map(n => n.code)).toContain("NET002");
  });

  it("delete network: not found", async () => {
    await expect(repo.deleteNetwork("unknown")).rejects.toThrow(NotFoundError);
  });






});
