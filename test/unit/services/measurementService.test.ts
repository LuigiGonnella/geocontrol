import { MeasurementService } from "@services/measurementService";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

describe("MeasurementService", () => {
  let mockRepo: jest.Mocked<MeasurementRepository>;
  let service: MeasurementService;

  beforeEach(() => {
    mockRepo = {
      getStatistics: jest.fn().mockResolvedValue([{ mean: 5 }]),
      getOutliers: jest.fn().mockResolvedValue([{ value: 99 }]),
      getMeasurements: jest.fn(),
      getMeasurementsByNetwork: jest.fn(),
      getStatisticsByNetwork: jest.fn(),
      getOutliersByNetwork: jest.fn(),
      createMeasurement: jest.fn(),
    } as unknown as jest.Mocked<MeasurementRepository>;

    service = new MeasurementService(mockRepo);
  });

  it("calls getStatistics on the repository", async () => {
    const result = await service.getStatistics("sensor-1");
    expect(mockRepo.getStatistics).toHaveBeenCalledWith("sensor-1", undefined, undefined);
    expect(result).toEqual([{ mean: 5 }]);
  });

  it("calls getOutliers on the repository", async () => {
    const result = await service.getOutliers("sensor-1");
    expect(mockRepo.getOutliers).toHaveBeenCalledWith("sensor-1", undefined, undefined);
    expect(result).toEqual([{ value: 99 }]);
  });
    it("calls getStatisticsByNetwork on the repository", async () => {
    const result = await service.getStatisticsByNetwork("network-1");
    expect(mockRepo.getStatisticsByNetwork).toHaveBeenCalledWith("network-1", undefined, undefined);

  });

  it("calls getOutliersByNetwork on the repository", async () => {
    const result = await service.getOutliersByNetwork("network-1");
    expect(mockRepo.getOutliersByNetwork).toHaveBeenCalledWith("network-1", undefined, undefined);
 
  });

});
