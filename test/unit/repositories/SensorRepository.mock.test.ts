import { ConflictError } from "@errors/ConflictError";
import { NotFoundError } from "@errors/NotFoundError";
import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { mock } from "node:test";

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      findOneOrFail: jest.fn(),
    }),
  },
}));

const mockRepo = require("@database").AppDataSource.getRepository();

describe("SensorRepository (mock)", () => {
  let repo: SensorRepository;
  // Mock gateway object with all required fields for GatewayDAO
const mockGateway: GatewayDAO = {
  macAddress: "G",
  name: "Gateway",
  description: "desc",
  network: {
    code: "NET001",
    name: "Test Network",
    description: "desc",
    gateways: [] // required by NetworkDAO
  },
  sensors: []
};

  beforeEach(() => {
    repo = new SensorRepository();
    jest.clearAllMocks();
  });

  it("getAllSensorsforGateway", async () => {
    mockRepo.findOne.mockResolvedValue({ macAddress: "G" });
    mockRepo.find.mockResolvedValue([{ macAddress: "A" }]);
    await expect(repo.getAllSensorsforGateway("G")).resolves.toEqual([{ macAddress: "A" }]);
});
  

  it("createSensor - success", async () => {
    mockRepo.find.mockResolvedValue([]);
    mockRepo.create.mockReturnValue({ macAddress: "A" });
    mockRepo.save.mockResolvedValue({ macAddress: "A" });
    await expect(repo.createSensor("A", "N", "D", "V", "U", mockGateway)).resolves.toEqual({ macAddress: "A" });
  });

  it("createSensor - conflict", async () => {
    mockRepo.find.mockResolvedValue([{ macAddress: "A" }]);
    await expect(repo.createSensor("A", "N", "D", "V", "U", mockGateway)).rejects.toThrow(ConflictError);
  });

  it("getSensorByMacAddress - found", async () => {
    mockRepo.find.mockResolvedValue([{ macAddress: "A" }]);
    await expect(repo.getSensorByMacAddress("A")).resolves.toEqual({ macAddress: "A" });
  });

  it("getSensorByMacAddress - not found", async () => {
    mockRepo.find.mockResolvedValue([]);
    await expect(repo.getSensorByMacAddress("A")).rejects.toThrow(NotFoundError);
  });  it("updateSensor - found", async () => {
    const sensorWithMeasurements = { 
      macAddress: "A", 
      measurements: [],
      name: "Old Name",
      description: "Old Desc",
      variable: "temp",
      unit: "C"
    }; // Include measurements array and other properties
    mockRepo.find.mockResolvedValueOnce([sensorWithMeasurements]) // Find existing sensor A with measurements
                   .mockResolvedValueOnce([]); // Simulate that B doesn't exist (no conflict)
    mockRepo.findOne.mockResolvedValueOnce({ macAddress: "G" }) // Mock gateway lookup
                    .mockResolvedValueOnce({ macAddress: "A" }); // Mock sensor lookup for removal
    mockRepo.remove.mockResolvedValue();
    mockRepo.save.mockResolvedValue({ macAddress: "B" });
    mockRepo.findOneOrFail.mockResolvedValue({ macAddress: "B" });
    await expect(repo.updateSensor("A", "B", "N", "D", "V", "U", "G")).resolves.toEqual({ macAddress: "B" });
  });

  it("updateSensor - not found", async () => {
    mockRepo.find.mockResolvedValue([]);
    await expect(repo.updateSensor("A", "B", "N", "D", "V", "U", "G")).rejects.toThrow(NotFoundError);
  });
  
  it("updateSensor - gateway not found", async () => {
    mockRepo.find.mockResolvedValueOnce([{ macAddress: "A" , measurements:[] }]) 
    mockRepo.findOne.mockResolvedValueOnce(null); 
    await expect(repo.updateSensor("A", "B", "N", "D", "V", "U", "G")).rejects.toThrow(NotFoundError);
  });


  it("deleteSensor - found", async () => {
    repo.getSensorByMacAddress = jest.fn().mockResolvedValue({ macAddress: "A" });
    mockRepo.remove.mockResolvedValue();
    await expect(repo.deleteSensor("A")).resolves.toBeUndefined();
  });

  it("deleteSensor - not found", async () => {
    repo.getSensorByMacAddress = jest.fn().mockRejectedValue(new NotFoundError("Sensor not found"));
    await expect(repo.deleteSensor("A")).rejects.toThrow(NotFoundError);
  });
});