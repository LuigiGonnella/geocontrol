import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";


describe("Measurements E2E", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    // Crea la rete, il gateway e il sensore necessari
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "NETMS", name: "Network MS", description: "desc" });
      
    await request(app)
      .post("/api/v1/networks/NETMS/gateways")
      .set("Authorization", `Bearer ${token}`)
      .send({ macAddress: "GWMS", name: "Gateway MS", description: "desc" });
    await request(app)
      .post("/api/v1/networks/NETMS/gateways/GWMS/sensors")
      .set("Authorization", `Bearer ${token}`)
      .send({ macAddress: "SNMS", name: "Sensor MS", description: "desc", variable: "temp", unit: "C"});
  });

  afterAll(async () => {
    await afterAllE2e();
  });

 it("should record and get measurements, stats, outliers", async () => {
  const now = new Date().toISOString();

  // Prima measurement per SNMS
  await request(app)
    .post("/api/v1/networks/NETMS/gateways/GWMS/sensors/SNMS/measurements")
    .set("Authorization", `Bearer ${token}`)
    .send([{ value: 42, createdAt: now }, { value: 44, createdAt: now }]);


  // Crea secondo sensore (senza gatewayMac nel body!)
const createSensorRes = await request(app)
  .post("/api/v1/networks/NETMS/gateways/GWMS/sensors")
  .set("Authorization", `Bearer ${token}`)
  .send({
    macAddress: "SNMS2",
    name: "Sensor2",
    description: "desc",
    variable: "temp",
    unit: "C"
  });
console.log("Create SNMS2:", createSensorRes.status, createSensorRes.body);

// Prima measurement per SNMS2
const meas1 = await request(app)
  .post("/api/v1/networks/NETMS/gateways/GWMS/sensors/SNMS2/measurements")
  .set("Authorization", `Bearer ${token}`)
  .send([{ value: 43, createdAt: now }, { value: 45, createdAt: now }]);
console.log("POST measurement SNMS2:", meas1.status, meas1.body);
expect(meas1.status).toBe(201);


const snms2Meas = await request(app)
  .get("/api/v1/networks/NETMS/gateways/GWMS/sensors/SNMS2/measurements")
  .set("Authorization", `Bearer ${token}`);
console.log("SNMS2 measurements:", snms2Meas.body);
expect(snms2Meas.body.measurements.length).toBe(2);

const sensors = await request(app)
  .get("/api/v1/networks/NETMS/gateways/GWMS/sensors")
  .set("Authorization", `Bearer ${token}`);
console.log("Sensors in GWMS:", sensors.body);
expect(sensors.body.length).toBe(2);

const snmsMeas = await request(app)
  .get("/api/v1/networks/NETMS/gateways/GWMS/sensors/SNMS/measurements")
  .set("Authorization", `Bearer ${token}`);
console.log("SNMS measurements:", snmsMeas.body);
expect(snmsMeas.body.measurements.length).toBe(2);

const gateways = await request(app)
  .get("/api/v1/networks/NETMS/gateways")
  .set("Authorization", `Bearer ${token}`);
console.log("Gateways in NETMS:", gateways.body);



const allNetMeasurements = await request(app)
  .get("/api/v1/networks/NETMS/measurements") 
  .set("Authorization", `Bearer ${token}`);
console.log("All network measurements:", allNetMeasurements.body);

expect(allNetMeasurements.status).toBe(200);
  // Get statistics by network
const netStatsRes = await request(app)
  .get("/api/v1/networks/NETMS/stats") 
  .set("Authorization", `Bearer ${token}`);

expect(netStatsRes.status).toBe(200);

// Get outliers by network
const netOutliersRes = await request(app)
  .get("/api/v1/networks/NETMS/outliers") 
  .set("Authorization", `Bearer ${token}`);
expect(netOutliersRes.status).toBe(200);
}, 100000);
});