import * as gatewayController from "@controllers/gatewayController";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";

jest.mock("@repositories/GatewayRepository");

describe("gatewayController", () => {
  const expectedGateway = {
    macAddress: "GAT001",
    name: "Gateway 1",
    description: "desc"};

  const fakeGateway: GatewayDAO = {
    macAddress: "GAT001",
    name: "Gateway 1",
    description: "desc",
    network: { code: "NET001" }
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getGatewaysByNetwork", async () => {
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getAllGatewaysforNetwork: jest.fn().mockResolvedValue([fakeGateway])
    }));
    const result = await gatewayController.getGatewaysByNetwork("NET001");
    expect(result).toEqual([expectedGateway]);
  });

  it("getGatewayByMac", async () => {
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getGatewayByMacAddress: jest.fn().mockResolvedValue(fakeGateway)
    }));
    const result = await gatewayController.getGatewayByMac("GAT001");
    expect(result).toEqual(expectedGateway);
  });

  it("createGateway", async () => {
    const createGateway = jest.fn().mockResolvedValue(undefined);
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      createGateway
    }));
    await gatewayController.createGateway("NET001", fakeGateway as any);
    expect(createGateway).toHaveBeenCalledWith(
      fakeGateway.macAddress,
      fakeGateway.name,
      fakeGateway.description,
      "NET001"
    );
  });

  it("updateGateway", async () => {
    const updateGateway = jest.fn().mockResolvedValue(undefined);
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      updateGateway
    }));
    await gatewayController.updateGateway("GAT001", { ...fakeGateway, macAddress: "GAT002" }, "NET001");
    expect(updateGateway).toHaveBeenCalledWith(
      "GAT001",
      "GAT002",
      fakeGateway.name,
      fakeGateway.description,
      "NET001"
    );
  });

  it("deleteGateway", async () => {
    const deleteGateway = jest.fn().mockResolvedValue(undefined);
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      deleteGateway
    }));
    await gatewayController.deleteGateway("GAT001", "NET001");
    expect(deleteGateway).toHaveBeenCalledWith("GAT001", "NET001");
  });
});