const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockSave = jest.fn();
const mockCreateQueryBuilder = jest.fn();


import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { SensorDAO } from "@models/dao/SensorDAO";


jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: mockFindOne,
      create: mockCreate,
      save: mockSave,
      createQueryBuilder: mockCreateQueryBuilder,
    }),
  },
}));

describe("MeasurementRepository (mock)", () => {
  const repo = new MeasurementRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockReset();
    mockCreate.mockReset();
    mockSave.mockReset();
    mockCreateQueryBuilder.mockReset();
  });

  it("createMeasurement - sensor found", async () => {
    const sensor = new SensorDAO();
    sensor.macAddress = "S";
    mockFindOne.mockResolvedValue(sensor);

    const measurement = new MeasurementDAO();
    measurement.value = 42;
    measurement.sensor = sensor;
    mockCreate.mockReturnValue(measurement);
    mockSave.mockResolvedValue(measurement);

    const result = await repo.createMeasurement("S", 42, new Date());
    expect(result).toBe(measurement);
  });

  it("createMeasurement - sensor not found", async () => {
    mockFindOne.mockResolvedValue(null);
    await expect(repo.createMeasurement("NOPE", 1, new Date())).rejects.toThrow();
  });

  it("getMeasurements - with/without dates", async () => {
    const qb: any = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([new MeasurementDAO(), new MeasurementDAO()])
    };
    mockCreateQueryBuilder.mockReturnValue(qb);

    // senza date
    let result = await repo.getMeasurements("S");
    expect(result.length).toBe(2);

    // con date
    result = await repo.getMeasurements("S", new Date(), new Date());
    expect(result.length).toBe(2);
  });

  it("getStatistics - ok", async () => {
  jest.spyOn(repo, "getMeasurements").mockResolvedValue([{ value: 1 }, { value: 3 }] as any);
  const stats = await repo.getStatistics("S");
  expect(stats.mean).toBe(2);
  expect(stats.variance).toBe(1);
  expect(stats.upperThreshold).toBe(2 + 2 * 1); // mean + 2*std
  expect(stats.lowerThreshold).toBe(2 - 2 * 1); // mean - 2*std
});
  it("getStatistics - no data", async () => {
    jest.spyOn(repo, "getMeasurements").mockResolvedValue([]);
    const result = await repo.getStatistics("S");
    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: undefined,
      endDate: undefined
    }); 
  });
  it("getStatistics - no data but startDate and endDate defined", async () => {
    const start = new Date("2024-01-01T00:00:00.000Z");
    const end = new Date("2024-01-02T00:00:00.000Z");

    jest.spyOn(repo, "getMeasurements").mockResolvedValue([]);
    const result = await repo.getStatistics("S", start, end);

    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
});


 it("getOutliers - ok", async () => {
  jest.spyOn(repo, "getStatistics").mockResolvedValue({ mean: 2, variance: 1, upperThreshold: 4, lowerThreshold: 0 , startDate: undefined, endDate: undefined });
  jest.spyOn(repo, "getMeasurements").mockResolvedValue([
    { value: 2 }, { value: 10 }, { value: -10 }
  ] as any);
  const outliers = await repo.getOutliers("S");
  expect(outliers.length).toBe(2);
  expect(outliers.map(o => o.value)).toEqual([10, -10]);
});
  it("getOutliers - no data", async () => {
    jest.spyOn(repo, "getStatistics").mockResolvedValue({ mean: 0, variance: 0, upperThreshold: 0, lowerThreshold: 0, startDate: undefined, endDate: undefined });
    jest.spyOn(repo, "getMeasurements").mockResolvedValue([]);
    const result = await repo.getOutliers("S");
    expect(result).toEqual([]);
  });

  it("getMeasurementsByNetwork - with/without dates", async () => {
    const qb: any = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([new MeasurementDAO()])
    };
    mockCreateQueryBuilder.mockReturnValue(qb);

    // senza date
    let result = await repo.getMeasurementsByNetwork("NET");
    expect(result.length).toBe(1);

    // con date
    result = await repo.getMeasurementsByNetwork("NET", new Date(), new Date());
    expect(result.length).toBe(1);
  });

  it("getStatisticsByNetwork - ok", async () => {
  jest.spyOn(repo, "getMeasurementsByNetwork").mockResolvedValue([{ value: 1 }, { value: 3 }] as any);
  const stats = await repo.getStatisticsByNetwork("NET");
  expect(stats.mean).toBe(2);
  expect(stats.variance).toBe(1);
  expect(stats.upperThreshold).toBe(4);
  expect(stats.lowerThreshold).toBe(0);
});
  it("getStatisticsByNetwork - no data", async () => {
    jest.spyOn(repo, "getMeasurementsByNetwork").mockResolvedValue([]);
    const result = await repo.getStatisticsByNetwork("NET");
    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: undefined,
      endDate: undefined
    }); 
  });

  it("getStatisticsByNetwork - no data but startDate and endDate defined", async () => {
    const start = new Date("2024-01-01T00:00:00.000Z");
    const end = new Date("2024-01-02T00:00:00.000Z");

    jest.spyOn(repo, "getMeasurementsByNetwork").mockResolvedValue([]);
    const result = await repo.getStatisticsByNetwork("NET", start, end);

    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
  });


  it("getOutliersByNetwork - ok", async () => {
  jest.spyOn(repo, "getStatisticsByNetwork").mockResolvedValue({ mean: 2, variance: 1, upperThreshold: 4, lowerThreshold: 0 , startDate: undefined, endDate: undefined });
  jest.spyOn(repo, "getMeasurementsByNetwork").mockResolvedValue([
    { value: 2 }, { value: 10 }, { value: -10 }
  ] as any);
  const outliers = await repo.getOutliersByNetwork("NET");
  expect(outliers.length).toBe(2);
  expect(outliers.map(o => o.value)).toEqual([10, -10]);
});
  it("getOutliersByNetwork - no data", async () => {
    jest.spyOn(repo, "getStatisticsByNetwork").mockResolvedValue({ mean: 0, variance: 0, upperThreshold: 0, lowerThreshold: 0, startDate: undefined, endDate: undefined });
    jest.spyOn(repo, "getMeasurementsByNetwork").mockResolvedValue([]);
    const result = await repo.getOutliersByNetwork("NET");
    expect(result).toEqual([]);
  });

  it("getStatistics includes startDate and endDate fields", async () => {
    const qb: any = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ value: 1 }, { value: 3 }])
    };
    mockCreateQueryBuilder.mockReturnValue(qb);
    const repo = new MeasurementRepository();
    const start = new Date("2024-01-01T00:00:00.000Z");
    const end = new Date("2024-01-02T00:00:00.000Z");
    const stats = await repo.getStatistics("S", start, end);
    expect(stats.startDate).toBe(start.toISOString());
    expect(stats.endDate).toBe(end.toISOString());
  });

  it("getStatisticsByNetwork includes startDate and endDate fields", async () => {
    const qb: any = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ value: 1 }, { value: 3 }])
    };
    mockCreateQueryBuilder.mockReturnValue(qb);
    const repo = new MeasurementRepository();
    const start = new Date("2024-01-01T00:00:00.000Z");
    const end = new Date("2024-01-02T00:00:00.000Z");
    const stats = await repo.getStatisticsByNetwork("NET", start, end);
    expect(stats.startDate).toBe(start.toISOString());
    expect(stats.endDate).toBe(end.toISOString());
  });
});