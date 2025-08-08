import request from "supertest";
import { app } from "@app";
import * as authController from "@controllers/authController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import authenticationRoutes from "@routes/authenticationRoutes";

app.use("/api/v1/auth", authenticationRoutes);
jest.mock("@controllers/authController");

describe("Authentication routes integration", () => {
  const route = "/api/v1/auth";
  const validUser = {username: "testUser", password: "testPassword"};
  const testToken = { token: "test.token" };

  afterEach(() => jest.clearAllMocks());

  it("should return 200 and a token for valid credentials", async () => {
    (authController.getToken as jest.Mock).mockResolvedValue(testToken);
    const res = await request(app)
      .post(route)
      .send(validUser);
    expect(res.status).toBe(200);
  });
  

  it("should return 400 if request body is invalid", async () => {
    (authController.getToken as jest.Mock).mockResolvedValue(new Error("Invalid request"));
    const res = await request(app)
      .post("/api/v1/auth")
      .send({}); 
    expect(res.status).toBe(400);
  });


  it("should return 401 for invalid credentials", async () => {
    (authController.getToken as jest.Mock).mockRejectedValue(new UnauthorizedError("Invalid password"));
    const res = await request(app)
      .post(route)
      .send(validUser);
    expect(res.status).toBe(401);
  });

  it("should return 404 for user not found", async () => {
    (authController.getToken as jest.Mock).mockRejectedValue(new NotFoundError("User not found"));
    const res = await request(app)
      .post(route)
      .send(validUser);
    expect(res.status).toBe(404);
  });
  

  it("should return 500 on unexpected error", async () => {
    (authController.getToken as jest.Mock).mockImplementation(() => {throw new Error("fail");});
    const res = await request(app)
      .post(route)
      .send(validUser);
    expect(res.status).toBe(500);
  });

});