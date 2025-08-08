import * as sensorController from "@controllers/sensorController";
import { SensorRepository } from "@repositories/SensorRepository";
import { SensorDAO } from "@dao/SensorDAO";

jest.mock("@repositories/SensorRepository");

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: jest.fn()}}));

describe("sensorController", () => {  const fakeSensorDAO: SensorDAO = {
    macAddress: "SEN001",
    name: "Sensor 1",
    description: "desc",
    variable: "temp",
    unit: "C",
    gateway: { macAddress: "GAT001" }
  } as any;

  const expectedSensorDTO = {
    macAddress: "SEN001",
    name: "Sensor 1",
    description: "desc",
    variable: "temp",
    unit: "C"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });  
  
  it("getSensorsByGateway", async () => {
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getAllSensorsforGateway: jest.fn().mockResolvedValue([fakeSensorDAO])
    }));

    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") {
        return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      }
      if (dao.name === "GatewayDAO") {
        return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "NET001" } }) };
      }
      return {};
    });

    const result = await sensorController.getSensorsByGateway("NET001", "GAT001");
    expect(result).toEqual([expectedSensorDTO]);
  });

  it("getSensorsByGateway - gateway not found", async () => {
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") {
        return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      }
      if (dao.name === "GatewayDAO") {
        return { findOne: jest.fn().mockResolvedValue(null) }; 
      }
      return {};
    });
    await expect(sensorController.getSensorsByGateway("NET001", "GAT404"))
      .rejects.toThrow("Gateway with MAC address 'GAT404' not found");
  });

  it("getSensorsByGateway - gateway belongs to wrong network", async () => {
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") {
        return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      }
      if (dao.name === "GatewayDAO") {
        return {findOne: jest.fn().mockResolvedValue({macAddress: "GAT001", network: { code: "NETXXX" }})
        };
      }
      return {};
    });

    await expect(sensorController.getSensorsByGateway("NET001", "GAT001"))
      .rejects.toThrow("Gateway with MAC address 'GAT001' not found in network 'NET001'");
  });


  it("getSensorByMac", async () => {
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorByMacAddress: jest.fn().mockResolvedValue(fakeSensorDAO)
    }));
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") {
        return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      }
      if (dao.name === "GatewayDAO") {
        return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "NET001" } }) };
      }
      return {};
    });

    const result = await sensorController.getSensorByMac("NET001", "GAT001", "SEN001");
    expect(result).toEqual(expectedSensorDTO);
  });

  it("getSensorByMac - throws if gateway not found", async () => {
  const mockGetRepository = require("@database").AppDataSource.getRepository;
  mockGetRepository.mockImplementation((dao) => {
    if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
    if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue(null) };
    return {};
  });

  await expect(sensorController.getSensorByMac("NET001", "GAT404", "SEN001"))
    .rejects.toThrow("Gateway with MAC address 'GAT404' not found");
});

it("getSensorByMac - throws if gateway not in network", async () => {
  const mockGetRepository = require("@database").AppDataSource.getRepository;
  mockGetRepository.mockImplementation((dao) => {
    if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
    if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "OTHER" } }) };
    return {};
  });

  await expect(sensorController.getSensorByMac("NET001", "GAT001", "SEN001"))
    .rejects.toThrow("Gateway with MAC address 'GAT001' not found in network 'NET001'");
});

  
  it("createSensor", async () => {
  const createSensor = jest.fn().mockResolvedValue(undefined);
  (SensorRepository as jest.Mock).mockImplementation(() => ({
    createSensor
  }));
  const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") {
        return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      }
      if (dao.name === "GatewayDAO") {
        return {
          findOne: jest.fn().mockResolvedValue({
            macAddress: "GAT001",
            name: "Gateway",
            description: "desc",
            network: { code: "NET001" },
            sensors: []
          })
        };
      }
      return {};
    });

    await sensorController.createSensor("NET001", "GAT001", expectedSensorDTO as any);
    expect(createSensor).toHaveBeenCalled();
  });
  
  it("updateSensor", async () => {
    const updateSensor = jest.fn().mockResolvedValue(undefined);
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      updateSensor
    }));   
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") {
        return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      }
      if (dao.name === "GatewayDAO") {
        return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "NET001" } }) };
      }
      return {};
    });

    await sensorController.updateSensor("NET001", "GAT001", "SEN001", { ...expectedSensorDTO, macAddress: "SEN002" });
    expect(updateSensor).toHaveBeenCalled();
  });

  it("updateSensor - throws if gateway not found", async () => {
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue(null) };
      return {};
    });

    await expect(sensorController.updateSensor("NET001", "GAT404", "SEN001", expectedSensorDTO))
        .rejects.toThrow("Gateway with MAC address 'GAT404' not found");
    });

  it("updateSensor - throws if gateway in wrong network", async () => {
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "OTHER" } }) };
      return {};
    });

    await expect(sensorController.updateSensor("NET001", "GAT001", "SEN001", expectedSensorDTO))
      .rejects.toThrow("Gateway with MAC address 'GAT001' not found in network 'NET001'");
  });


  it("deleteSensor", async () => {
    const deleteSensor = jest.fn().mockResolvedValue(undefined);
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      deleteSensor
  }));
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") {
        return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      }
      if (dao.name === "GatewayDAO") {
        return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "NET001" } }) };
      }
      return {};
    });

    await sensorController.deleteSensor("NET001", "GAT001", "SEN001");
    expect(deleteSensor).toHaveBeenCalledWith("SEN001");
  });

  it("createSensor - gateway not found", async () => {
  // Mock findOneBy and findOne to return null for gateway lookup
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET404" }) };
      if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue(null) };
      return {};
    });

    await expect(sensorController.createSensor("NET404", "GAT404", expectedSensorDTO as any))
      .rejects.toThrow("Gateway with MAC address 'GAT404' not found");
  });

  it("createSensor - gateway in wrong network", async () => {
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "OTHER" } }) };
      return {};
    });

    await expect(sensorController.createSensor("NET001", "GAT001", expectedSensorDTO as any))
      .rejects.toThrow("Gateway with MAC address 'GAT001' not found in network 'NET001'");
  });
  
  it("deleteSensor - throws if gateway not found", async () => {
    const mockGetRepository = require("@database").AppDataSource.getRepository;
    mockGetRepository.mockImplementation((dao) => {
      if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
      if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue(null) };
      return {};
    });

    await expect(sensorController.deleteSensor("NET001", "GAT404", "SEN001"))
      .rejects.toThrow("Gateway with MAC address 'GAT404' not found");
  });

  it("deleteSensor - throws if gateway in wrong network", async () => {
      const mockGetRepository = require("@database").AppDataSource.getRepository;
      mockGetRepository.mockImplementation((dao) => {
        if (dao.name === "NetworkDAO") return { findOneBy: jest.fn().mockResolvedValue({ code: "NET001" }) };
        if (dao.name === "GatewayDAO") return { findOne: jest.fn().mockResolvedValue({ macAddress: "GAT001", network: { code: "OTHER" } }) };
        return {};
      });

      await expect(sensorController.deleteSensor("NET001", "GAT001", "SEN001"))
        .rejects.toThrow("Gateway with MAC address 'GAT001' not found in network 'NET001'");
    });

  });