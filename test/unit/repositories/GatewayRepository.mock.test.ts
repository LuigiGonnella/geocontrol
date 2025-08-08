import { Sensor } from './../../../src/models/dto/Sensor';
import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { SensorDAO } from '@models/dao/SensorDAO';

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();
const mockCreate = jest.fn();
const mockFindOneOrFail = jest.fn();
const mockFindOne = jest.fn();


jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove,
      create: mockCreate,
      findOneOrFail: mockFindOneOrFail, // Usa il mock qui!
      findOne: mockFindOne, // AGGIUNGI QUESTO

    })
  }
}));

mockCreate.mockImplementation(obj => obj);

describe("GatewayRepository: mocked database", () => {
  const repo = new GatewayRepository();

  beforeEach(() => {

    jest.clearAllMocks();
    mockFind.mockReset();
  });

  it("create gateway", async () => {
  mockFind.mockResolvedValue([]);
  const mockNetwork = new NetworkDAO();
  mockNetwork.code = "NET001";
  mockFindOne.mockResolvedValue(mockNetwork);

  const savedGateway = new GatewayDAO();
  savedGateway.macAddress = "GAT001";
  savedGateway.name = "Test Gateway";
  savedGateway.description = "Test Description";
  savedGateway.network = mockNetwork;
  mockSave.mockResolvedValue(savedGateway);
  mockFindOneOrFail.mockResolvedValue(savedGateway);

  const result = await repo.createGateway("GAT001", "Test Gateway", "Test Description", "NET001");

  expect(result).toBeInstanceOf(GatewayDAO);
  expect(result.macAddress).toBe("GAT001");
  expect(result.name).toBe("Test Gateway");
  expect(result.description).toBe("Test Description");
  expect(result.network).toBe(mockNetwork);
  expect(mockSave).toHaveBeenCalledWith({
    macAddress: "GAT001",
    name: "Test Gateway",
    description: "Test Description",
    network: mockNetwork
  });
});

  it("create gateway: conflict", async () => {
    const mockNetwork = new NetworkDAO();
    mockNetwork.code = "NET001";
    const existingGateway = new GatewayDAO();
    existingGateway.macAddress = "GAT001";
    existingGateway.name = "Test Gateway";
    existingGateway.description = "Test Description";
    existingGateway.network = mockNetwork;

    mockFind.mockResolvedValue([existingGateway]);

    await expect(
      repo.createGateway("GAT001", "Test Gateway", "Test Description", "NET001")
    ).rejects.toThrow(ConflictError);
  });

  it("find gateway by macAddress", async () => {

    const foundGateway = new GatewayDAO();
    foundGateway.macAddress = "GAT001";
    foundGateway.name = "Test Gateway";
    foundGateway.description = "Test description";
    mockFind.mockResolvedValue([foundGateway]);

    const result = await repo.getGatewayByMacAddress("GAT001");
    expect(result).toBe(foundGateway);
  });

  it("find gateway by macAddress: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getGatewayByMacAddress("unknown")).rejects.toThrow(
      NotFoundError
    );
  });

  it("delete gateway", async () => {
    const mockNetwork = new NetworkDAO();
    mockNetwork.code = "NET001";
    const gateway = new GatewayDAO();
    gateway.macAddress = "GAT001";
    gateway.name = "Test Gateway";
    gateway.description = "Test Description";
    gateway.network = mockNetwork;    mockFind.mockResolvedValue([gateway]);
    mockRemove.mockResolvedValue(undefined);

    await repo.deleteGateway("GAT001", "NET001");
    expect(mockRemove).toHaveBeenCalledWith(gateway);
  });
/*
  It is not in users but maybe needed(?)
  it("delete gateway: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.deleteGateway("unknown","NET001")).rejects.toThrow(
      NotFoundError
    );
  });
  */
    it("update gateway", async () => {
    const mockNetwork = new NetworkDAO();
    mockNetwork.code = "NET001";
    const oldGateway = new GatewayDAO();
    oldGateway.macAddress = "GAT001";
    oldGateway.name = "Test Network";
    oldGateway.description = "Test Description";
    oldGateway.network = mockNetwork;

    const mockSensor = new SensorDAO();
    mockSensor.macAddress = "SENSOR001";
    mockSensor.name = "Test Sensor";
    mockSensor.description = "Test Description";
    mockSensor.variable = "temperature";
    mockSensor.unit = "Celsius";
    mockSensor.gateway = oldGateway;
    oldGateway.sensors = [mockSensor];    mockFind
      .mockResolvedValueOnce([oldGateway])  // Find old gateway GAT001
      .mockResolvedValueOnce([])            // No conflict for GAT002 (doesn't exist)
      .mockResolvedValueOnce([mockNetwork]) // Find network NET001
      .mockResolvedValueOnce([mockSensor]); // Find sensors to remove
    mockRemove.mockResolvedValue(undefined);

    const updatedGateway = new GatewayDAO();
    updatedGateway.macAddress = "GAT002";
    updatedGateway.name = "Updated Gateway";
    updatedGateway.description = "Updated Description";
    updatedGateway.network = mockNetwork;

    mockSave.mockResolvedValue(updatedGateway);
    mockFindOneOrFail.mockResolvedValue(updatedGateway);

    const result = await repo.updateGateway("GAT001","GAT002", "Updated Gateway", "Updated Description", "NET001");

    expect(result).toBe(updatedGateway);
  });
 
    it("get all gateways for network", async () => {
  const mockNetwork = new NetworkDAO();
  mockNetwork.code = "NET001";
  const gateway1 = new GatewayDAO();
  gateway1.macAddress = "GAT001";
  gateway1.name = "Test Gateway 1";
  gateway1.description = "Test Description 1";
  gateway1.network = mockNetwork;

  const gateway2 = new GatewayDAO();
  gateway2.macAddress = "GAT002";
  gateway2.name = "Test Gateway 2";
  gateway2.description = "Test Description 2";
  gateway2.network = mockNetwork;

  mockFind.mockResolvedValue([gateway1, gateway2]); 

  const result = await repo.getAllGatewaysforNetwork("NET001");

  expect(result).toEqual([gateway1, gateway2]);
});

   it ("update gateway: not found", async () => {
     mockFind.mockResolvedValue([]);
 
     await expect(repo.updateGateway("unknown", "GAT002", "Updated Gateway", "Updated Description", "NET001")).rejects.toThrow(
       NotFoundError
     );
   })
 });
