import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { TestDataSource, closeTestDataSource, initializeTestDataSource } from "@test/setup/test-datasource";

describe("MeasurementRepository (db)", () => {
  let repo: MeasurementRepository;

  beforeAll(async () => {
    await initializeTestDataSource();
    repo = new MeasurementRepository();
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

  it("create, get, statistics, outliers", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NET", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G", name: "GW", description: "desc", network });
    const sensor = await sensorRepo.save({ macAddress: "S", name: "N", description: "D", variable: "V", unit: "U", gateway });

    await repo.createMeasurement("S", 2, new Date());
    await repo.createMeasurement("S", 4, new Date());

    // Get
    const all = await repo.getMeasurements("S");
    expect(all.length).toBeGreaterThanOrEqual(2);

    // Statistics
    const stats = await repo.getStatistics("S");
    expect(stats.mean).toBe(3);

    // Outliers
    const outliers = await repo.getOutliers("S");
    expect(Array.isArray(outliers)).toBe(true);
  });

  it("createMeasurement - sensor not found", async () => {
    await expect(repo.createMeasurement("NOPE", 1, new Date())).rejects.toThrow();
  });

  it("getStatistics - no data", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NOGW", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G2", name: "GW", description: "desc", network });    await sensorRepo.save({ macAddress: "S2", name: "N", description: "D", variable: "V", unit: "U", gateway });

    const result = await repo.getStatistics("S2");
    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: undefined,
      endDate: undefined
    });
  });

  it("getMeasurementsByNetwork, getStatisticsByNetwork, getOutliersByNetwork", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    // Crea la rete
    const network = await networkRepo.save({ code: "NET", name: "Network", description: "desc" });
    // Crea il gateway associato alla rete
    const gateway = await gatewayRepo.save({ macAddress: "G3", name: "GW", description: "desc", network });
    // Crea due sensori associati al gateway
    const sensor1 = await sensorRepo.save({ macAddress: "S1", name: "N1", description: "D1", variable: "V1", unit: "U1", gateway });
    const sensor2 = await sensorRepo.save({ macAddress: "S2", name: "N2", description: "D2", variable: "V2", unit: "U2", gateway });

    // Crea misurazioni per entrambi i sensori
    await repo.createMeasurement("S1", 10, new Date());
    await repo.createMeasurement("S1", 20, new Date());
    await repo.createMeasurement("S2", 30, new Date());

    // getMeasurementsByNetwork
    const all = await repo.getMeasurementsByNetwork("NET");
    expect(all.length).toBe(3);

    // getStatisticsByNetwork
    const stats = await repo.getStatisticsByNetwork("NET");
    expect(stats.mean).toBe(20);
    expect(stats.variance).toBeCloseTo(66.666, 2);

    // getOutliersByNetwork (nessun outlier con questi dati)
    const outliers = await repo.getOutliersByNetwork("NET");
    expect(Array.isArray(outliers)).toBe(true);    // getStatisticsByNetwork - no data
    const noDataStats = await repo.getStatisticsByNetwork("NONET");
    expect(noDataStats).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: undefined,
      endDate: undefined
    });

    // getOutliersByNetwork - no data
    const noDataOutliers = await repo.getOutliersByNetwork("NONET");
    expect(Array.isArray(noDataOutliers)).toBe(true);
    expect(noDataOutliers.length).toBe(0);
  });

  it("getMeasurements - with date filters", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NET4", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G4", name: "GW", description: "desc", network });
    const sensor = await sensorRepo.save({ macAddress: "S4", name: "N", description: "D", variable: "V", unit: "U", gateway });

    const now = new Date();
    const past = new Date(now.getTime() - 1000 * 60 * 60);
    await repo.createMeasurement("S4", 1, past);
    await repo.createMeasurement("S4", 2, now);

    const all = await repo.getMeasurements("S4", past, now);
    expect(all.length).toBeGreaterThanOrEqual(2);

    const filtered = await repo.getMeasurements("S4", new Date(now.getTime() - 500), now);
    expect(filtered.length).toBe(1);
  });

  it("getOutliers - no outliers", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NET5", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G5", name: "GW", description: "desc", network });
    const sensor = await sensorRepo.save({ macAddress: "S5", name: "N", description: "D", variable: "V", unit: "U", gateway });

    await repo.createMeasurement("S5", 10, new Date());
    await repo.createMeasurement("S5", 12, new Date());
    const outliers = await repo.getOutliers("S5");
    expect(outliers.length).toBe(0);
  });

  it("getOutliers - with outlier", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NET6", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G6", name: "GW", description: "desc", network });
    const sensor = await sensorRepo.save({ macAddress: "S6", name: "N", description: "D", variable: "V", unit: "U", gateway });

    await repo.createMeasurement("S6", 10, new Date());
    await repo.createMeasurement("S6", 10, new Date());
    await repo.createMeasurement("S6", 10, new Date());
    await repo.createMeasurement("S6", 10, new Date());
    await repo.createMeasurement("S6", 10, new Date());
    await repo.createMeasurement("S6", 10, new Date());

    await repo.createMeasurement("S6", 100000000, new Date());
    const outliers = await repo.getOutliers("S6");
    expect(outliers.some(m => m.value === 100000000)).toBe(true);
  });

  it("getMeasurementsByNetwork - with date filters", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NET2", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G7", name: "GW", description: "desc", network });
    const sensor = await sensorRepo.save({ macAddress: "S7", name: "N", description: "D", variable: "V", unit: "U", gateway });

    const now = new Date();
    const past = new Date(now.getTime() - 1000 * 60 * 60);
    await repo.createMeasurement("S7", 1, past);
    await repo.createMeasurement("S7", 2, now);

    const all = await repo.getMeasurementsByNetwork("NET2", past, now);
    expect(all.length).toBeGreaterThanOrEqual(2);

    const filtered = await repo.getMeasurementsByNetwork("NET2", new Date(now.getTime() - 500), now);
    expect(filtered.length).toBe(1);
  });
  it("getStatisticsByNetwork - no data", async () => {
    const result = await repo.getStatisticsByNetwork("NONET");
    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: undefined,
      endDate: undefined
    });
  });

  it("getOutliersByNetwork - no data", async () => {
    const result = await repo.getOutliersByNetwork("NONET");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
  it("getStatistics - throws if no measurements", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NOGW2", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G8", name: "GW", description: "desc", network });
    await sensorRepo.save({ macAddress: "S8", name: "N", description: "D", variable: "V", unit: "U", gateway });

    const result = await repo.getStatistics("S8");
    expect(result).toEqual({
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      startDate: undefined,
      endDate: undefined
    });
  });
  it("getOutliers - throws if no measurements", async () => {
    const networkRepo = TestDataSource.getRepository(NetworkDAO);
    const gatewayRepo = TestDataSource.getRepository(GatewayDAO);
    const sensorRepo = TestDataSource.getRepository(SensorDAO);

    const network = await networkRepo.save({ code: "NOGW3", name: "Network", description: "desc" });
    const gateway = await gatewayRepo.save({ macAddress: "G9", name: "GW", description: "desc", network });
    await sensorRepo.save({ macAddress: "S9", name: "N", description: "D", variable: "V", unit: "U", gateway });

    const result = await repo.getOutliers("S9");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});