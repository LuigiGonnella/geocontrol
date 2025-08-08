import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Networks E2E", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("should create, get, update, and delete a network", async () => {
    // Create
    const createRes = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "NETE2E", name: "E2E Network", description: "desc" });
    expect(createRes.status).toBe(201);

    // Get all
    const getAllRes = await request(app)
      .get("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`);
    expect(getAllRes.status).toBe(200);
    expect(getAllRes.body.some((n: any) => n.code === "NETE2E")).toBe(true);

    // Get by code
    const getRes = await request(app)
      .get("/api/v1/networks/NETE2E")
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.code).toBe("NETE2E");

    // Update
    const patchRes = await request(app)
  .patch("/api/v1/networks/NETE2E")
  .set("Authorization", `Bearer ${token}`)
  .send({ code: "NETE2E", name: "Updated Network", description: "desc" }); 
expect(patchRes.status).toBe(204);

    // Delete
    const delRes = await request(app)
      .delete("/api/v1/networks/NETE2E")
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(204);

    // Get after delete
    const getAfterDel = await request(app)
      .get("/api/v1/networks/NETE2E")
      .set("Authorization", `Bearer ${token}`);
    expect(getAfterDel.status).toBe(404);
  });
});