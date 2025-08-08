import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as gatewayController from "@controllers/gatewayController";
import { UserType } from "@models/UserType";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";


jest.mock("@services/authService");
jest.mock("@controllers/gatewayController");

describe("GatewayRoutes integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "NET001";
  const gatewayMac = "GAT001";
  const fakeGateway = { macAddress: gatewayMac, name: "GW", description: "desc", network: { code: networkCode } };

  afterEach(() => jest.clearAllMocks());

  it("get all gateways by network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGatewaysByNetwork as jest.Mock).mockResolvedValue([fakeGateway]);
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeGateway]);
  });

  it("get gateway by mac", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGatewayByMac as jest.Mock).mockResolvedValue(fakeGateway);
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeGateway);
  });

  it("create gateway", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", token)
      .send(fakeGateway);
    expect(res.status).toBe(201);
    expect(gatewayController.createGateway).toHaveBeenCalled();
  });

  it("update gateway", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token)
      .send(fakeGateway);
    expect(res.status).toBe(204);
    expect(gatewayController.updateGateway).toHaveBeenCalled();
  });

  it("delete gateway", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.deleteGateway as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token);
    expect(res.status).toBe(204);
    expect(gatewayController.deleteGateway).toHaveBeenCalled();
  });

  it("get all gateways: 404 Network Not Found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGatewaysByNetwork as jest.Mock).mockImplementation(() => { throw new NotFoundError("Network not found"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token);
    expect(res.status).toBe(404);
    });

    it("create gateway: 404 Network Not Found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => { throw new NotFoundError("Network not found"); });
    const res = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send(fakeGateway);
    expect(res.status).toBe(404);
    });

  it("get all gateways: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new UnauthorizedError("Unauthorized"); });
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", "Bearer invalid");
    expect(res.status).toBe(401);
  });

  it("get all gateways: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new InsufficientRightsError("Forbidden"); });
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", token);
    expect(res.status).toBe(403);
  });


    it("get all gateways: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGatewaysByNetwork as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("create gateway: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send({});
    expect(res.status).toBe(400);
    });

    it("get gateway by mac: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGatewayByMac as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("update gateway: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send({});
    expect(res.status).toBe(500);
    });

    it("delete gateway: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.deleteGateway as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("create gateway: 400 BadRequest", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Bad request");
  (err as any).status = 400;
  (gatewayController.createGateway as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", token)
    .send({}); 
  expect(res.status).toBe(400);
});

it("create gateway: 409 Conflict", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Conflict");
  (err as any).status = 409;
  (gatewayController.createGateway as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .post(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", token)
    .send(fakeGateway);
  expect(res.status).toBe(409);
});
});