import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import {
  recordMeasurement,
  getMeasurementsBySensor,
  getStatisticsBySensor,
  getOutliersBySensor,
  getMeasurementsByNetwork,
  getStatisticsByNetwork,
  getOutliersByNetwork
} from "@controllers/measurementController";

const router = Router({ mergeParams: true });

// Store a measurement for a sensor (Admin & Operator)
router.post("/gateways/:gatewayMac/sensors/:sensorMac/measurements", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try {
    await recordMeasurement(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, req.body);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

// Retrieve measurements for a specific sensor
router.get("/gateways/:gatewayMac/sensors/:sensorMac/measurements", authenticateUser(), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    res.status(200).json(await getMeasurementsBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate as string, endDate as string));
  } catch (error) {
    next(error);
  }
});

// Retrieve statistics for a specific sensor
router.get("/gateways/:gatewayMac/sensors/:sensorMac/stats", authenticateUser(), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    res.status(200).json(await getStatisticsBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate as string, endDate as string));
  } catch (error) {
    next(error);
  }
});

// Retrieve outliers for a specific sensor
router.get("/gateways/:gatewayMac/sensors/:sensorMac/outliers", authenticateUser(), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    res.status(200).json(await getOutliersBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, startDate as string, endDate as string));
  } catch (error) {
    next(error);
  }
});

/// Route corretta per measurements di rete
router.get(
  "/measurements",
  authenticateUser(),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      res.status(200).json(
        await getMeasurementsByNetwork(
          req.params.networkCode,
          startDate as string,
          endDate as string
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/stats",
  authenticateUser(),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      res.status(200).json(
        await getStatisticsByNetwork(
          req.params.networkCode,
          startDate as string,
          endDate as string
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/outliers",
  authenticateUser(),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      res.status(200).json(
        await getOutliersByNetwork(
          req.params.networkCode,
          startDate as string,
          endDate as string
        )
      );
    } catch (error) {
      next(error);
    }
  }
);
export default router;