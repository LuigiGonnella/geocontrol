import * as networkController from "@controllers/networkController";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@dao/NetworkDAO";

jest.mock("@repositories/NetworkRepository");

describe("networkController", () => {
  const fakeNetwork: NetworkDAO = {
    code: "NET001",
    name: "Network 1",
    description: "desc"
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAllNetworks", async () => {
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getAllNetworks: jest.fn().mockResolvedValue([fakeNetwork])
    }));
    const result = await networkController.getAllNetworks();
    expect(result).toEqual([fakeNetwork]);
  });

  it("getNetworkByCode", async () => {
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByNetworkCode: jest.fn().mockResolvedValue(fakeNetwork)
    }));
    const result = await networkController.getNetworkByCode("NET001");
    expect(result).toEqual(fakeNetwork);
  });

  it("createNetwork", async () => {
    const createNetwork = jest.fn().mockResolvedValue(undefined);
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      createNetwork
    }));
    await networkController.createNetwork(fakeNetwork as any);
    expect(createNetwork).toHaveBeenCalledWith(
      fakeNetwork.code,
      fakeNetwork.name,
      fakeNetwork.description
    );
  });

  it("updateNetwork", async () => {
    const updateNetwork = jest.fn().mockResolvedValue(undefined);
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      updateNetwork
    }));
    await networkController.updateNetwork("NET001", { ...fakeNetwork, code: "NET002" });
    expect(updateNetwork).toHaveBeenCalledWith(
      "NET001",
      "NET002",
      fakeNetwork.name,
      fakeNetwork.description
    );
  });

  it("deleteNetwork", async () => {
    const deleteNetwork = jest.fn().mockResolvedValue(undefined);
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      deleteNetwork
    }));
    await networkController.deleteNetwork("NET001");
    expect(deleteNetwork).toHaveBeenCalledWith("NET001");
  });
});