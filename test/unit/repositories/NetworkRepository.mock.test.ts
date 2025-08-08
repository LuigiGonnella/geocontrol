import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { GatewayDAO } from "@models/dao/GatewayDAO";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();
const mockFindOneOrFail = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove,
      findOneOrFail: mockFindOneOrFail,
    })
  }
}));

describe("NetworkRepository: mocked database", () => {
  const repo = new NetworkRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create network", async () => {
    mockFind.mockResolvedValue([]);

    const savedNetwork = new NetworkDAO();
    savedNetwork.code = "NET001";
    savedNetwork.name = "Test Network";
    savedNetwork.description = "Test Description";

    mockSave.mockResolvedValue(savedNetwork);

    const result = await repo.createNetwork("NET001", "Test Network", "Test Description");

    expect(result).toBeInstanceOf(NetworkDAO);
    expect(result.code).toBe("NET001");
    expect(result.name).toBe("Test Network");
    expect(result.description).toBe("Test Description");
    expect(mockSave).toHaveBeenCalledWith({
      code: "NET001",
      name: "Test Network",
      description: "Test Description"
    });
  });

  it("create network: conflict", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "NET001";
    existingNetwork.name = "Test Network";
    existingNetwork.description = "Test Description";

    mockFind.mockResolvedValue([existingNetwork]);

    await expect(
      repo.createNetwork("NET001", "Test Network", "Test Description")
    ).rejects.toThrow(ConflictError);
  });

  it("getAllNetworks", async () => {
    const n1 = new NetworkDAO();
    n1.code = "N1";
    n1.name = "Name1";
    n1.description = "Desc1";
    const n2 = new NetworkDAO();
    n2.code = "N2";
    n2.name = "Name2";
    n2.description = "Desc2";
    mockFind.mockResolvedValue([n1, n2]);
    const result = await repo.getAllNetworks();
    expect(result).toEqual([n1, n2]);
  });

  it("find network by code", async () => {
    const foundNetwork = new NetworkDAO();
    foundNetwork.code = "NET001";
    foundNetwork.name = "Test Network";
    foundNetwork.description = "Test description";

    mockFind.mockResolvedValue([foundNetwork]);

    const result = await repo.getNetworkByNetworkCode("NET001");
    expect(result).toBe(foundNetwork);
  });

  it("find network by code: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getNetworkByNetworkCode("unknown")).rejects.toThrow(
      NotFoundError
    );
  });

  it("delete network", async () => {
    const network = new NetworkDAO();
    network.code = "NET001";
    network.name = "Test Network";
    network.description = "Test Description";

    mockFind.mockResolvedValue([network]);
    mockRemove.mockResolvedValue(undefined);

    await repo.deleteNetwork("NET001");

    expect(mockRemove).toHaveBeenCalledWith(network);
  });
  

  it("delete network: not found", async () => {
  mockFind.mockResolvedValue([]);
  await expect(repo.deleteNetwork("unknown")).rejects.toThrow(NotFoundError);
});
  
  it("update network", async () => {
    const oldNetwork = new NetworkDAO();
    oldNetwork.code = "NET001";
    oldNetwork.name = "Test Network";
    oldNetwork.description = "Test Description";

    const mockGateway = new GatewayDAO();
    mockGateway.macAddress = "GAT001";
    mockGateway.name = "Test Gateway";
    mockGateway.description = "Test Description";
    mockGateway.network = oldNetwork;
    oldNetwork.gateways = [mockGateway];
    
    // First call: find existing network NET001
    // Second call: check for conflicts with NET002 (should be empty)
    // Third call: find NET001 again for deleteNetwork
    mockFind.mockResolvedValueOnce([oldNetwork])
      .mockResolvedValueOnce([]) // No conflict for NET002
      .mockResolvedValueOnce([oldNetwork]); // Find NET001 for deletion
    
    const updatedNetwork = new NetworkDAO();
    updatedNetwork.code = "NET002";
    updatedNetwork.name = "Updated Network";
    updatedNetwork.description = "Updated Description";
    mockFindOneOrFail.mockResolvedValue(updatedNetwork);
    mockRemove.mockResolvedValue(undefined);
    mockSave.mockResolvedValue(oldNetwork);
    
    const result = await repo.updateNetwork("NET001","NET002", "Updated Network", "Updated Description");

    expect(result).toBe(updatedNetwork);
});

  it ("update network: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.updateNetwork("unknown", "NET002", "Updated Network", "Updated Description")).rejects.toThrow(
      NotFoundError
    );
  })
});
