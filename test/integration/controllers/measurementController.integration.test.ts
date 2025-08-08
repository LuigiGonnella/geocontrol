import * as measurementController from "@controllers/measurementController";
import { measurementService } from "@controllers/measurementController";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { ConflictError } from "@models/errors/ConflictError";

// Mock the dependencies that use TypeORM
jest.mock("@services/networkService", () => ({
  getNetworkByCode: jest.fn().mockResolvedValue({ 
    code: "NET001", 
    name: "Test Network",
    gateways: [
      {
        macAddress: "GAT001",
        name: "Test Gateway",
        sensors: [
          { macAddress: "SEN001", name: "Test Sensor" }
        ]
      }
    ]
  })
}));

jest.mock("@controllers/gatewayController", () => ({
  getGatewayByMac: jest.fn().mockResolvedValue({ macAddress: "GAT001", name: "Test Gateway" })
}));

jest.mock("@controllers/sensorController", () => ({
  getSensorByMac: jest.fn().mockResolvedValue({ macAddress: "SEN001", name: "Test Sensor" })
}));

const fakeMeasurement: MeasurementDTO = {
  value: 42,
  createdAt: new Date().toISOString()
} as any;

describe("measurementController", () => {
  beforeEach(() => {
  jest.clearAllMocks();
  (measurementService as any).createMeasurement = jest.fn().mockResolvedValue(undefined);
  (measurementService as any).getMeasurements = jest.fn().mockResolvedValue([fakeMeasurement]);
  (measurementService as any).getStatistics = jest.fn().mockResolvedValue({ mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined });
  (measurementService as any).getOutliers = jest.fn().mockResolvedValue([fakeMeasurement]);
  (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([{ ...fakeMeasurement, sensor: { macAddress: "SEN001" } }]);
  (measurementService as any).getStatisticsByNetwork = jest.fn().mockResolvedValue({ mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined });
  (measurementService as any).getOutliersByNetwork = jest.fn().mockResolvedValue([fakeMeasurement]);
});

  it("recordMeasurement", async () => {
    await measurementController.recordMeasurement("NET001", "GAT001", "SEN001", [fakeMeasurement]);
    // No expect needed: just check no error thrown
  });

  it ("recordMeasurement throws ConflictError", async () => {
    (measurementService as any).createMeasurement = jest.fn().mockRejectedValue(new ConflictError("Measurement already exists"));
    await expect(measurementController.recordMeasurement("NET001", "GAT001", "SEN001", [fakeMeasurement])).rejects.toThrow(ConflictError);
  });

  it("recordMeasurement throws default internal server error when message is undefined", async () => {
    const errorWithoutMessage = new Error();
    Object.defineProperty(errorWithoutMessage, "message", { value: undefined });

    (measurementService as any).createMeasurement = jest.fn().mockRejectedValue(errorWithoutMessage);

    await expect(measurementController.recordMeasurement("NET001", "GAT001", "SEN001", [fakeMeasurement]))
      .rejects.toThrow("Internal server error");
  });


  it("getMeasurementsBySensor", async () => {
    const result = await measurementController.getMeasurementsBySensor("NET001", "GAT001", "SEN001");
    expect(result).toEqual({
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    });
  });
  it("getMeasurementsBySensor throws  ConflictError", async () => {
    (measurementService as any).getMeasurements = jest.fn().mockRejectedValue(new ConflictError("Conflict error"));
    await expect(measurementController.getMeasurementsBySensor("NET001", "GAT001", "SEN001")).rejects.toThrow(ConflictError);
  });
  it("getMeasurementsBySensor throws default Error if err.message is undefined", async () => {
    const errorWithoutMessage = new Error();
    Object.defineProperty(errorWithoutMessage, "message", { value: undefined });
    (measurementService as any).getMeasurements = jest.fn().mockRejectedValue(errorWithoutMessage);
    await expect(
      measurementController.getMeasurementsBySensor("NET001", "GAT001", "SEN001")
    ).rejects.toThrow("Internal server error");
  });


  it("getStatisticsBySensor", async () => {
  const result = await measurementController.getStatisticsBySensor("NET001", "GAT001", "SEN001");
  expect(result).toEqual({ mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1 });
});

  it("getStatisticsBySensor throws ConflictError", async () => {
    (measurementService as any).getStatistics = jest.fn().mockRejectedValue(new ConflictError("Conflict error"));
    await expect(measurementController.getStatisticsBySensor("NET001", "GAT001", "SEN001")).rejects.toThrow(ConflictError);
  });

  it("getStatisticsBySensor throws default Error if err.message is undefined", async () => {
    const errorWithoutMessage = new Error();
    Object.defineProperty(errorWithoutMessage, "message", { value: undefined });

    (measurementService as any).getStatistics = jest.fn().mockRejectedValue(errorWithoutMessage);

    await expect(
      measurementController.getStatisticsBySensor("NET001", "GAT001", "SEN001")
    ).rejects.toThrow("Internal server error");
  });


  it("getOutliersBySensor", async () => {
    const result = await measurementController.getOutliersBySensor("NET001", "GAT001", "SEN001");
    expect(result).toEqual({
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    });
  });
  it("getOutliersBySensor throws ConflictError", async () => {
    (measurementService as any).getOutliers = jest.fn().mockRejectedValue(new ConflictError("Conflict error"));
    await expect(measurementController.getOutliersBySensor("NET001", "GAT001", "SEN001")).rejects.toThrow(ConflictError);
  });

  it("getOutliersBySensor throws default Error if err.message is undefined", async () => {
    const errorWithoutMessage = new Error();
    Object.defineProperty(errorWithoutMessage, "message", { value: undefined });

    (measurementService as any).getOutliers = jest.fn().mockRejectedValue(errorWithoutMessage);

    await expect(
      measurementController.getOutliersBySensor("NET001", "GAT001", "SEN001")
    ).rejects.toThrow("Internal server error");
  });


  it("getMeasurementsByNetwork", async () => {
    const result = await measurementController.getMeasurementsByNetwork("NET001");
    expect(result).toEqual([{
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    }]);
  });
  it("getMeasurementsByNetwork throws default internal server error when message is undefined", async () => {
    const errorWithoutMessage = new Error();
    Object.defineProperty(errorWithoutMessage, "message", { value: undefined });

    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockRejectedValue(errorWithoutMessage);

    await expect(
      measurementController.getMeasurementsByNetwork("NET001")
    ).rejects.toThrow("Internal server error");
  });



  it("getStatisticsByNetwork", async () => {
    const result = await measurementController.getStatisticsByNetwork("NET001");
    expect(result).toEqual([{ 
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1 }
    }]);
  });
  it("getStatisticsByNetwork returns default stats with dates", async () => {
    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([]);
    const result = await measurementController.getStatisticsByNetwork("NET001", "2024-01-01", "2024-01-02");
    expect(result[0].stats.startDate).toBe("2024-01-01T00:00:00.000Z");
    expect(result[0].stats.endDate).toBe("2024-01-02T00:00:00.000Z");
  }); 

  it("getOutliersByNetwork", async () => {
    const result = await measurementController.getOutliersByNetwork("NET001");
    expect(result).toEqual([{
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    }]);
  });
  it("getMeasurementsBySensor with dates", async () => {
    const result = await measurementController.getMeasurementsBySensor("NET001", "GAT001", "SEN001", "2024-01-01", "2024-01-02");
    expect(result).toEqual({
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    });
  });
 it("getStatisticsBySensor with dates", async () => {
  const result = await measurementController.getStatisticsBySensor("NET001", "GAT001", "SEN001", "2024-01-01", "2024-01-02");
  expect(result).toEqual({ mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1 });
});  it("getOutliersBySensor with dates", async () => {
    const result = await measurementController.getOutliersBySensor("NET001", "GAT001", "SEN001", "2024-01-01", "2024-01-02");
    expect(result).toEqual({
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    });
  });
  it("getMeasurementsByNetwork with dates", async () => {
    const result = await measurementController.getMeasurementsByNetwork("NET001", "2024-01-01", "2024-01-02");
    expect(result).toEqual([{
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    }]);
  });
 it("getStatisticsByNetwork with dates", async () => {
  const result = await measurementController.getStatisticsByNetwork("NET001", "2024-01-01", "2024-01-02");
  expect(result).toEqual([{ 
    sensorMacAddress: "SEN001",
    stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1 }
  }]);
});
  it("getOutliersByNetwork with dates", async () => {
    const result = await measurementController.getOutliersByNetwork("NET001", "2024-01-01", "2024-01-02");
    expect(result).toEqual([{
      sensorMacAddress: "SEN001",
      stats: { mean: 1, variance: 1, upperThreshold: 3, lowerThreshold: -1, startDate: undefined, endDate: undefined },
      measurements: [{ ...fakeMeasurement, isOutlier: true }]
    }]);
  });

  it("getMeasurementsBySensor returns isOutlier undefined if thresholds missing", async () => {
    (measurementService as any).getStatistics = jest.fn().mockResolvedValue({ mean: 1, variance: 1 });
    const result = await measurementController.getMeasurementsBySensor("NET001", "GAT001", "SEN001");
    expect(result.measurements[0].isOutlier).toBeUndefined();
  });

  it("getMeasurementsBySensor returns isOutlier true if value is outlier", async () => {
    (measurementService as any).getStatistics = jest.fn().mockResolvedValue({ mean: 1, variance: 1, upperThreshold: 10, lowerThreshold: 0 });
    (measurementService as any).getMeasurements = jest.fn().mockResolvedValue([{ value: 42, createdAt: new Date().toISOString() }]);
    const result = await measurementController.getMeasurementsBySensor("NET001", "GAT001", "SEN001");
    expect(result.measurements[0].isOutlier).toBe(true);
  });

  it("getMeasurementsBySensor returns isOutlier false if value is not outlier", async () => {
    (measurementService as any).getStatistics = jest.fn().mockResolvedValue({ mean: 1, variance: 1, upperThreshold: 100, lowerThreshold: 0 });
    (measurementService as any).getMeasurements = jest.fn().mockResolvedValue([{ value: 42, createdAt: new Date().toISOString() }]);
    const result = await measurementController.getMeasurementsBySensor("NET001", "GAT001","SEN001");
    expect(result.measurements[0].isOutlier).toBe(false);
  });

  it("getMeasurementsByNetwork returns isOutlier undefined if thresholds missing", async () => {
    (measurementService as any).getStatistics = jest.fn().mockResolvedValue({ mean: 1, variance: 1 });
    const result = await measurementController.getMeasurementsByNetwork("NET001");
    expect(result).toHaveLength(1);
    expect(result[0].measurements[0].isOutlier).toBeUndefined();
  });

  it("getMeasurementsByNetwork returns isOutlier true if value is outlier", async () => {
    (measurementService as any).getStatistics = jest.fn().mockResolvedValue({ mean: 1, variance: 1, upperThreshold: 10, lowerThreshold: 0 });
    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([{ value: 42, createdAt: new Date().toISOString(), sensor: { macAddress: "SEN001" } }]);
    const result = await measurementController.getMeasurementsByNetwork("NET001");
    expect(result).toHaveLength(1);
    expect(result[0].measurements[0].isOutlier).toBe(true);
  });

  it("getMeasurementsByNetwork returns isOutlier false if value is not outlier", async () => {
    (measurementService as any).getStatistics = jest.fn().mockResolvedValue({ mean: 1, variance: 1, upperThreshold: 100, lowerThreshold: 0 });
    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([{ value: 42, createdAt: new Date().toISOString(), sensor: { macAddress: "SEN001" } }]);
    const result = await measurementController.getMeasurementsByNetwork("NET001");
    expect(result).toHaveLength(1);
    expect(result[0].measurements[0].isOutlier).toBe(false);
  });

  it("getMeasurementsByNetwork throws ConflictError", async () => {
    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockRejectedValue(new ConflictError("Conflict error"));
    await expect(measurementController.getMeasurementsByNetwork("NET001")).rejects.toThrow(ConflictError);
  });

  
  it("getStatisticsByNetwork throws ConflictError", async () => {
    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([
      { value: 42, createdAt: new Date().toISOString(), sensor: { macAddress: "SEN001" } }]);
    (measurementService as any).getStatistics = jest.fn().mockRejectedValue(new ConflictError("Conflict error"));
    await expect(measurementController.getStatisticsByNetwork("NET001")).rejects.toThrow(ConflictError);
  });

  it("getStatisticsByNetwork throws default Error if err.message is undefined", async () => {
    const errorWithoutMessage = new Error();
    Object.defineProperty(errorWithoutMessage, "message", { value: undefined });

    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([
      { value: 42, createdAt: new Date().toISOString(), sensor: { macAddress: "SEN001" } }
    ]);
    (measurementService as any).getStatistics = jest.fn().mockRejectedValue(errorWithoutMessage);

    await expect(
      measurementController.getStatisticsByNetwork("NET001")
    ).rejects.toThrow("Internal server error");
  });



  it("getOutliersByNetwork throws ConflictError", async () => {
    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([
      { value: 42, createdAt: new Date().toISOString(), sensor: { macAddress: "SEN001" } }]);
    (measurementService as any).getStatistics = jest.fn().mockRejectedValue(new ConflictError("Conflict error"));
    await expect(measurementController.getOutliersByNetwork("NET001")).rejects.toThrow(ConflictError);
  });
  it("getOutliersByNetwork returns no outliers if thresholds are not numbers", async () => {
    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([
      { value: 42, createdAt: new Date().toISOString(), sensor: { macAddress: "SEN001" } }
    ]);
    (measurementService as any).getStatistics = jest.fn().mockResolvedValue({
      mean: 1,
      variance: 1,
      upperThreshold: undefined,
      lowerThreshold: undefined
    });

    const result = await measurementController.getOutliersByNetwork("NET001");

    expect(result).toHaveLength(1);
    expect(result[0].measurements).toEqual([]); 
  });


  it("getOutliersByNetwork throws default Error if err.message is undefined", async () => {
    const errorWithoutMessage = new Error();
    Object.defineProperty(errorWithoutMessage, "message", { value: undefined });

    (measurementService as any).getMeasurementsByNetwork = jest.fn().mockRejectedValue(errorWithoutMessage);

    await expect(
      measurementController.getOutliersByNetwork("NET001")
    ).rejects.toThrow("Internal server error");
  });


  
  it("getOutliersByNetwork returns default stats with start/end dates when no measurements", async () => {
  (measurementService as any).getMeasurementsByNetwork = jest.fn().mockResolvedValue([]);
  const result = await measurementController.getOutliersByNetwork("NET001", "2024-01-01", "2024-01-02");

  expect(result[0].measurements).toEqual([]);
  expect(result[0].stats.startDate).toBe("2024-01-01T00:00:00.000Z");
  expect(result[0].stats.endDate).toBe("2024-01-02T00:00:00.000Z");
});


});