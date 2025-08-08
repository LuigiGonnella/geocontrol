import { MeasurementService } from "@services/measurementService";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { NotFoundError } from "@errors/NotFoundError";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { getNetworkByCode } from "@services/networkService";
import { getGatewayByMac } from "@controllers/gatewayController";
import { getSensorByMac } from "@controllers/sensorController";
import { ConflictError } from "@models/errors/ConflictError";
import { parseISODateParamToUTC } from "@utils";

export const measurementService = new MeasurementService();

export async function recordMeasurement(networkCode: string, gatewayMac: string, sensorMac: string, measurementDto: MeasurementDTO[]): Promise<void> {
  try {
    // Validate network, gateway, and sensor exist
    await getNetworkByCode(networkCode);
    await getGatewayByMac(gatewayMac);
    await getSensorByMac(networkCode, gatewayMac, sensorMac);
    
    for (const m of measurementDto) {
      await measurementService.createMeasurement(
        sensorMac,
        m.value,
        new Date(m.createdAt)
      );
    }
  } catch (err: any) {
    if (err instanceof NotFoundError) throw err;
    if (err instanceof ConflictError) throw err;
    throw new Error(err.message || "Internal server error");
  }
}

export async function getMeasurementsBySensor(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string): Promise<any> {
  try {
    // Validate network, gateway, and sensor exist
    await getNetworkByCode(networkCode);
    await getGatewayByMac(gatewayMac);
    await getSensorByMac(networkCode, gatewayMac, sensorMac);
    
    const measurements = await measurementService.getMeasurements(
      sensorMac,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    if (!measurements || measurements.length === 0) {
      // Return empty response with basic stats structure when no measurements found
      return {
        sensorMacAddress: sensorMac,
        stats: {
          startDate: parseISODateParamToUTC(startDate),
          endDate: parseISODateParamToUTC(endDate)
        },
        measurements: []
      };
    }
    
    const stats = await measurementService.getStatistics(
      sensorMac,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    const mappedMeasurements = measurements.map((m: any) => ({
      createdAt: m.createdAt,
      value: m.value,
      isOutlier: (typeof stats.upperThreshold === 'number' && typeof stats.lowerThreshold === 'number')
        ? (m.value > stats.upperThreshold || m.value < stats.lowerThreshold)
        : undefined
    }));
    
    return {
      sensorMacAddress: sensorMac,
      stats,
      measurements: mappedMeasurements
    };
  } catch (err: any) {
    if (err instanceof NotFoundError) throw err;
    if (err instanceof ConflictError) throw err;
    throw new Error(err.message || "Internal server error");
  }
}

export async function getStatisticsBySensor(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string): Promise<{ mean: number; variance: number; upperThreshold: number; lowerThreshold: number }> {
  try {
    // Validate network, gateway, and sensor exist
    await getNetworkByCode(networkCode);
    await getGatewayByMac(gatewayMac);
    await getSensorByMac(networkCode, gatewayMac, sensorMac);
    
    const stats = await measurementService.getStatistics(
      sensorMac,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    return stats;
  } catch (err: any) {
    if (err instanceof NotFoundError) throw err;
    if (err instanceof ConflictError) throw err;
    throw new Error(err.message || "Internal server error");
  }
}

export async function getOutliersBySensor(networkCode: string, gatewayMac: string, sensorMac: string, startDate?: string, endDate?: string): Promise<any> {
  try {
    // Validate network, gateway, and sensor exist
    await getNetworkByCode(networkCode);
    await getGatewayByMac(gatewayMac);
    await getSensorByMac(networkCode, gatewayMac, sensorMac);
    
    const outliers = await measurementService.getOutliers(
      sensorMac,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    // Get statistics for this sensor
    const stats = await measurementService.getStatistics(
      sensorMac,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    
    return {
      sensorMacAddress: sensorMac,
      stats,
      measurements: outliers.map(outlier => ({
        createdAt: outlier.createdAt,
        value: outlier.value,
        isOutlier: true
      }))
    };
  } catch (err: any) {
    if (err instanceof NotFoundError) throw err;
    if (err instanceof ConflictError) throw err;
    throw new Error(err.message || "Internal server error");
  }
}

export async function getMeasurementsByNetwork(networkCode: string, startDate?: string, endDate?: string): Promise<any[]> {
  try {
    await getNetworkByCode(networkCode);
    const measurements = await measurementService.getMeasurementsByNetwork(
      networkCode,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    if (!measurements || measurements.length === 0) {
      const sensors = await getNetworkByCode(networkCode).then(n => n.gateways.flatMap(g => g.sensors));
      return sensors.map(sensor => ({
        sensorMacAddress: sensor.macAddress,
        stats: {
          mean: 0,
          variance: 0,
          upperThreshold: 0,
          lowerThreshold: 0,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined
        },
        measurements: []
      }));
    }
    
    const grouped: { [sensorMac: string]: any[] } = {};
    for (const m of measurements) {
      const mac = m.sensor.macAddress;
      if (!grouped[mac]) grouped[mac] = [];
      grouped[mac].push(m);
    }
    const result = await Promise.all(Object.entries(grouped).map(async ([sensorMac, ms]) => {
      const stats = await measurementService.getStatistics(sensorMac,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      const mappedMeasurements = ms.map((m: any) => ({
        createdAt: m.createdAt,
        value: m.value,
        isOutlier: (typeof stats.upperThreshold === 'number' && typeof stats.lowerThreshold === 'number')
          ? (m.value > stats.upperThreshold || m.value < stats.lowerThreshold)
          : undefined
      }));
      return {
        sensorMacAddress: sensorMac,
        stats,
        measurements: mappedMeasurements
      };
    }));
    return result;
  } catch (err: any) {
    if (err instanceof NotFoundError) throw err;
    if (err instanceof ConflictError) throw err;
    throw new Error(err.message || "Internal server error");
  }
}

export async function getStatisticsByNetwork(networkCode: string, startDate?: string, endDate?: string): Promise<any[]> {
  try {
    await getNetworkByCode(networkCode);
    const measurements = await measurementService.getMeasurementsByNetwork(
      networkCode,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    if (!measurements || measurements.length === 0) {
      const sensors = await getNetworkByCode(networkCode).then(n => n.gateways.flatMap(g => g.sensors));
      return sensors.map(sensor => ({
        sensorMacAddress: sensor.macAddress,
        stats: {
          mean: 0,
          variance: 0,
          upperThreshold: 0,
          lowerThreshold: 0,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined
        },
        measurements: []
      }));
    }
    const grouped: { [sensorMac: string]: any[] } = {};
    for (const m of measurements) {
      const mac = m.sensor.macAddress;
      if (!grouped[mac]) grouped[mac] = [];
      grouped[mac].push(m);
    }
    const result = await Promise.all(Object.entries(grouped).map(async ([sensorMac, ms]) => {
      const stats = await measurementService.getStatistics(sensorMac,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      return {
        sensorMacAddress: sensorMac,
        stats
      };
    }));
    return result;
  } catch (err: any) {
    if (err instanceof NotFoundError) throw err;
    if (err instanceof ConflictError) throw err;
    throw new Error(err.message || "Internal server error");
  }
}

export async function getOutliersByNetwork(networkCode: string, startDate?: string, endDate?: string): Promise<any[]> {
  try {
    await getNetworkByCode(networkCode);
    const measurements = await measurementService.getMeasurementsByNetwork(
      networkCode,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

      if (!measurements || measurements.length === 0) {
      const sensors = await getNetworkByCode(networkCode).then(n => n.gateways.flatMap(g => g.sensors));
      return sensors.map(sensor => ({
        sensorMacAddress: sensor.macAddress,
        stats: {
          mean: 0,
          variance: 0,
          upperThreshold: 0,
          lowerThreshold: 0,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined
        },
        measurements: []
      }));
    }

    const grouped: { [sensorMac: string]: any[] } = {};
    for (const m of measurements) {
      const mac = m.sensor.macAddress;
      if (!grouped[mac]) grouped[mac] = [];
      grouped[mac].push(m);
    }
    const result = await Promise.all(Object.entries(grouped).map(async ([sensorMac, ms]) => {
      const stats = await measurementService.getStatistics(sensorMac,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      const outliers = ms.filter((m: any) =>
        (typeof stats.upperThreshold === 'number' && typeof stats.lowerThreshold === 'number')
          ? (m.value > stats.upperThreshold || m.value < stats.lowerThreshold)
          : false
      ).map((m: any) => ({
        createdAt: m.createdAt,
        value: m.value,
        isOutlier: true
      }));
      return {
        sensorMacAddress: sensorMac,
        stats,
        measurements: outliers
      };
    }));
    return result;
  } catch (err: any) {
    if (err instanceof NotFoundError) throw err;
    if (err instanceof ConflictError) throw err;
    throw new Error(err.message || "Internal server error");
  }
}