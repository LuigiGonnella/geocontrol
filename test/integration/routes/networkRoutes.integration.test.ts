import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";


jest.mock("@services/authService");
jest.mock("@controllers/networkController");

describe("NetworkRoutes integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "NET001";
  const fakeNetwork = { code: networkCode, name: "Network", description: "desc" };

  afterEach(() => jest.clearAllMocks());

  it("get all networks", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getAllNetworks as jest.Mock).mockResolvedValue([fakeNetwork]);
    const res = await request(app)
      .get(`/api/v1/networks`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([fakeNetwork]);
  });

  it("get network by code", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetworkByCode as jest.Mock).mockResolvedValue(fakeNetwork);
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}`)
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeNetwork);
  });

  it("create network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .post(`/api/v1/networks`)
      .set("Authorization", token)
      .send(fakeNetwork);
    expect(res.status).toBe(201);
    expect(networkController.createNetwork).toHaveBeenCalled();
  });

  it("update network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}`)
      .set("Authorization", token)
      .send(fakeNetwork);
    expect(res.status).toBe(204);
    expect(networkController.updateNetwork).toHaveBeenCalled();
  });

  it("delete network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}`)
      .set("Authorization", token);
    expect(res.status).toBe(204);
    expect(networkController.deleteNetwork).toHaveBeenCalled();
  });

  it("get all networks: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new UnauthorizedError("Unauthorized"); });
    const res = await request(app)
      .get(`/api/v1/networks`)
      .set("Authorization", "Bearer invalid");
    expect(res.status).toBe(401);
  });

  it("get all networks: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new InsufficientRightsError("Forbidden"); });
    const res = await request(app)
      .get(`/api/v1/networks`)
      .set("Authorization", token);
    expect(res.status).toBe(403);
  });


    it("get all networks: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getAllNetworks as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("create network: error handler", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (networkController.createNetwork as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
  const validBody = { code: "NET_ERR", name: "Network Err", description: "desc" };
  const res = await request(app)
    .post(`/api/v1/networks`)
    .set("Authorization", token)
    .send(validBody);
  expect(res.status).toBe(500);
});

    it("get network by code: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetworkByCode as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .get(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

    it("update network: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .patch(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token)
        .send({});
    expect(res.status).toBe(500);
    });

    it("delete network: error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const res = await request(app)
        .delete(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token);
    expect(res.status).toBe(500);
    });

it("get network by code: 400 BadRequest", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Bad request");
  (err as any).status = 400;
  (networkController.getNetworkByCode as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .get(`/api/v1/networks/INVALID_CODE`)
    .set("Authorization", token);
  expect(res.status).toBe(400);
});

it("get network by code: 401 Unauthorized", async () => {
  (authService.processToken as jest.Mock).mockImplementation(() => { throw new UnauthorizedError("Unauthorized"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}`)
    .set("Authorization", "Bearer invalid");
  expect(res.status).toBe(401);
});

it("get network by code: 403 Forbidden", async () => {
  (authService.processToken as jest.Mock).mockImplementation(() => { throw new InsufficientRightsError("Forbidden"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}`)
    .set("Authorization", token);
  expect(res.status).toBe(403);
});

it("get network by code: 404 NotFound", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (networkController.getNetworkByCode as jest.Mock).mockImplementation(() => { throw new NotFoundError("Not found"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}`)
    .set("Authorization", token);
  expect(res.status).toBe(404);
});

it("get network by code: 409 Conflict", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  const err = new Error("Conflict");
  (err as any).status = 409;
  (networkController.getNetworkByCode as jest.Mock).mockImplementation(() => { throw err; });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}`)
    .set("Authorization", token);
  expect(res.status).toBe(409);
});

it("get network by code: 500 InternalServerError", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (networkController.getNetworkByCode as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}`)
    .set("Authorization", token);
  expect(res.status).toBe(500);
});
});