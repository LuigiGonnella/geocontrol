import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Sensors E2E", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    // Crea la rete e il gateway necessari
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "NETSN", name: "Network SN", description: "desc" });
    await request(app)
      .post("/api/v1/networks/NETSN/gateways")
      .set("Authorization", `Bearer ${token}`)
      .send({ macAddress: "GWSN", name: "Gateway SN", description: "desc" });
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("should create, get, update, and delete a sensor", async () => {
    // Create
    const createRes = await request(app)
      .post("/api/v1/networks/NETSN/gateways/GWSN/sensors")
      .set("Authorization", `Bearer ${token}`)
      .send({ macAddress: "SNE2E", name: "Sensor E2E", description: "desc", variable: "temp", unit: "C" });
    expect(createRes.status).toBe(201);

    // Get all
    const getAllRes = await request(app)
      .get("/api/v1/networks/NETSN/gateways/GWSN/sensors")
      .set("Authorization", `Bearer ${token}`);
    expect(getAllRes.status).toBe(200);
    expect(getAllRes.body.some((s: any) => s.macAddress === "SNE2E")).toBe(true);

    // Get by mac
    const getRes = await request(app)
      .get("/api/v1/networks/NETSN/gateways/GWSN/sensors/SNE2E")
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("SNE2E");

    // Update
   const patchRes = await request(app)
  .patch("/api/v1/networks/NETSN/gateways/GWSN/sensors/SNE2E")
  .set("Authorization", `Bearer ${token}`)
  .send({ macAddress: "SNE2E", name: "Updated Sensor", description: "desc", variable: "temp", unit: "C", gatewayMac: "GWSN" });
expect(patchRes.status).toBe(204);

    // Delete
    const delRes = await request(app)
      .delete("/api/v1/networks/NETSN/gateways/GWSN/sensors/SNE2E")
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(204);

    // Get after delete
    const getAfterDel = await request(app)
      .get("/api/v1/networks/NETSN/gateways/GWSN/sensors/SNE2E")
      .set("Authorization", `Bearer ${token}`);
    expect(getAfterDel.status).toBe(404);
  }, 100000);
});