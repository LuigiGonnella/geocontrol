import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as measurementController from "@controllers/measurementController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@services/authService");
jest.mock("@controllers/measurementController");

describe("MeasurementRoutes integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "NET001";
  const gatewayMac = "GAT001";
  const sensorMac = "SEN001";
  const fakeMeasurement = { value: 42, createdAt: new Date().toISOString() };

  afterEach(() => jest.clearAllMocks());

  it("record measurement", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.recordMeasurement as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", token)
      .send([fakeMeasurement]);
    expect(res.status).toBe(201);
    expect(measurementController.recordMeasurement).toHaveBeenCalled();
  });

  it("get measurements by sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getMeasurementsBySensor as jest.Mock).mockResolvedValue([fakeMeasurement]);
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeMeasurement]);
  });

  it("get statistics by sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getStatisticsBySensor as jest.Mock).mockResolvedValue({ mean: 1, variance: 1 });
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mean: 1, variance: 1 });
  });

  it("get outliers by sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getOutliersBySensor as jest.Mock).mockResolvedValue([fakeMeasurement]);
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeMeasurement]);
  });


    it("get measurements by network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getMeasurementsByNetwork as jest.Mock).mockResolvedValue([fakeMeasurement]);
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/measurements`)
        .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeMeasurement]);
    });

    it("get statistics by network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getStatisticsByNetwork as jest.Mock).mockResolvedValue({ mean: 1, variance: 1 });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/stats`)
        .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mean: 1, variance: 1 });
    });

    it("get outliers by network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getOutliersByNetwork as jest.Mock).mockResolvedValue([fakeMeasurement]);
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/outliers`)
        .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeMeasurement]);
    });


  it("record measurement: 401 UnauthorizedError", async () => {
  (authService.processToken as jest.Mock).mockImplementation(() => { throw new UnauthorizedError("Unauthorized"); });
  const validBody = [{ value: 42, createdAt: new Date().toISOString() }];
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", "Bearer invalid")
    .send(validBody);
  expect(res.status).toBe(401);
});

it("record measurement: 403 InsufficientRightsError", async () => {
  (authService.processToken as jest.Mock).mockImplementation(() => { throw new InsufficientRightsError("Forbidden"); });
  const validBody = [{ value: 42, createdAt: new Date().toISOString() }];
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(403);
});


    it("record measurement: error handler", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.recordMeasurement as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
  const validBody = [{ value: 1, createdAt: new Date().toISOString() }];
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(500);
});

    it("get measurements by sensor: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getMeasurementsBySensor as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("get statistics by sensor: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getStatisticsBySensor as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("get outliers by sensor: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getOutliersBySensor as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("get measurements by network: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getMeasurementsByNetwork as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/measurements`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("get statistics by network: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getStatisticsByNetwork as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/stats`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("get outliers by network: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getOutliersByNetwork as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/outliers`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });



it("record measurement: 400 BadRequest", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Bad request");
  (err as any).status = 400;
  (measurementController.recordMeasurement as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token)
    .send({});
  expect(res.status).toBe(400);
});

it("record measurement: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.recordMeasurement as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  // Invia un body valido!
  const validBody = [{ value: 1, createdAt: new Date().toISOString() }];
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(404);
});

it("record measurement: 409 Conflict", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Conflict");
  (err as any).status = 409;
  (measurementController.recordMeasurement as jest.Mock).mockImplementation(() => { throw err; });
  // Invia un body valido!
  const validBody = [{ value: 1, createdAt: new Date().toISOString() }];
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(409);
});


it("get measurements by sensor: 400 BadRequest", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Bad request");
  (err as any).status = 400;
  (measurementController.getMeasurementsBySensor as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token);
  expect(res.status).toBe(400);
});

it("get measurements by sensor: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.getMeasurementsBySensor as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("get measurements by sensor: 409 Conflict", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Conflict");
  (err as any).status = 409;
  (measurementController.getMeasurementsBySensor as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
    .set("Authorization", token);
  expect(res.status).toBe(409);
});


it("get statistics by sensor: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.getStatisticsBySensor as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("get outliers by sensor: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.getOutliersBySensor as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("get measurements by network: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.getMeasurementsByNetwork as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/measurements`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("get statistics by network: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.getStatisticsByNetwork as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/stats`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("get outliers by network: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (measurementController.getOutliersByNetwork as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/outliers`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});
});