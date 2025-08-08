import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as sensorController from "@controllers/sensorController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@services/authService");
jest.mock("@controllers/sensorController");

describe("SensorRoutes integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "NET001";
  const gatewayMac = "GAT001";
  const sensorMac = "SEN001";
  const fakeSensor = { macAddress: sensorMac, name: "Sensor", description: "desc", variable: "temp", unit: "C", gateway: { macAddress: gatewayMac } };

  afterEach(() => jest.clearAllMocks());

  it("get all sensors by gateway", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorsByGateway as jest.Mock).mockResolvedValue([fakeSensor]);
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeSensor]);
  });

  it("get sensor by mac", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorByMac as jest.Mock).mockResolvedValue(fakeSensor);
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeSensor);
  });

  it("create sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", token)
      .send(fakeSensor);
    expect(res.status).toBe(201);
    expect(sensorController.createSensor).toHaveBeenCalled();
  });

  it("update sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
      .set("Authorization", token)
      .send(fakeSensor);
    expect(res.status).toBe(204);
    expect(sensorController.updateSensor).toHaveBeenCalled();
  });

  it("delete sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
      .set("Authorization", token);
    expect(res.status).toBe(204);
    expect(sensorController.deleteSensor).toHaveBeenCalled();
  });

  it("get all sensors: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new UnauthorizedError("Unauthorized"); });
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", "Bearer invalid");
    expect(res.status).toBe(401);
  });

  it("get all sensors: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new InsufficientRightsError("Forbidden"); });
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", token);
    expect(res.status).toBe(403);
  });


    it("get all sensors: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorsByGateway as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("create sensor: error handler", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (sensorController.createSensor as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
  const validBody = { macAddress: "SEN_ERR", name: "Sensor Err", description: "desc", variable: "temp", unit: "C" };
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(500);
});

    it("get sensor by mac: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorByMac as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("update sensor: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token)
        .send({});
    expect(res.status).toBe(500);
    });

    it("delete sensor: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });


it("get all sensors: 400 BadRequest", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Bad request");
  (err as any).status = 400;
  (sensorController.getSensorsByGateway as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors?invalid=1`)
    .set("Authorization", token);
  expect(res.status).toBe(400);
});

it("get all sensors: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (sensorController.getSensorsByGateway as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("get all sensors: 409 Conflict", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Conflict");
  (err as any).status = 409;
  (sensorController.getSensorsByGateway as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
    .set("Authorization", token);
  expect(res.status).toBe(409);
});


it("create sensor: 400 BadRequest", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Bad request");
  (err as any).status = 400;
  (sensorController.createSensor as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
    .set("Authorization", token)
    .send({});
  expect(res.status).toBe(400);
});

it("create sensor: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (sensorController.createSensor as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const validBody = { macAddress: "SEN_ERR", name: "Sensor Err", description: "desc", variable: "temp", unit: "C" };
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(404);
});

it("create sensor: 409 Conflict", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Conflict");
  (err as any).status = 409;
  (sensorController.createSensor as jest.Mock).mockImplementation(() => { throw err; });
  const validBody = { macAddress: "SEN_ERR", name: "Sensor Err", description: "desc", variable: "temp", unit: "C" };
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(409);
});


it("get sensor by mac: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (sensorController.getSensorByMac as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("update sensor: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (sensorController.updateSensor as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
    .set("Authorization", token)
    .send({});
  expect(res.status).toBe(404);
});

it("delete sensor: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (sensorController.deleteSensor as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});
});