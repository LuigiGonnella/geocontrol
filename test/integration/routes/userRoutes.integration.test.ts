import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as userController from "@controllers/userController";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@services/authService");
jest.mock("@controllers/userController");

describe("UserRoutes integration", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("get all users", async () => {
    const mockUsers: UserDTO[] = [
      { username: "admin", type: UserType.Admin },
      { username: "viewer", type: UserType.Viewer }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin
    ]);
    expect(userController.getAllUsers).toHaveBeenCalled();
  });

  it("get all users: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get all users: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("get all users: 500 error handler", async () => {
  (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (userController.getAllUsers as jest.Mock).mockImplementation(() => { throw new Error("fail"); });

  const response = await request(app)
    .get("/api/v1/users")
    .set("Authorization", token);

  expect(response.status).toBe(500);
  expect(response.body.message).toMatch(/fail/);
});

  // 201 Created
  it("create user: 201 Created", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockResolvedValue({ username: "newuser", type: UserType.Viewer });
    const validBody = { username: "newuser", password: "pass123", type: UserType.Viewer };


    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(validBody);

    expect(response.status).toBe(201);
  });

  // 400 Bad Request
  it("create user: 400 BadRequest", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    // Invia un body non valido (manca password)
    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send({ username: "newuser", type: UserType.Viewer });

    expect(response.status).toBe(400);
  });

  // 401 Unauthorized
  it("create user: 401 UnauthorizedError", async () => {
  (authService.processToken as jest.Mock).mockImplementation(() => { throw new UnauthorizedError("Unauthorized: No token provided"); });
    const validBody = { username: "newuser", password: "pass123", type: UserType.Viewer };


    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", "Bearer invalid")
      .send(validBody);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  // 403 Forbidden
  it("create user: 403 InsufficientRightsError", async () => {
  (authService.processToken as jest.Mock).mockImplementation(() => { throw new InsufficientRightsError("Forbidden: Insufficient rights"); });
    const validBody = { username: "newuser", password: "pass123", type: UserType.Viewer };


    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(validBody);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Forbidden/);
  });

  // 409 Conflict
  it("create user: 409 Conflict", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
  (userController.createUser as jest.Mock).mockImplementation(() => { throw new ConflictError("User already exists"); });
    const validBody = { username: "newuser", password: "pass123", type: UserType.Viewer };


    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(validBody);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/User already exists/);
  });

  // 500 Internal Server Error
  it("create user: 500 error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const validBody = { username: "newuser", password: "pass123", type: UserType.Viewer };


    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(validBody);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/fail/);
  });


  // 204 No Content
  it("delete user: 204 No Content", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockResolvedValue(undefined);
    const username = "userToDelete";


    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(204);
  });

  // 401 Unauthorized
  it("delete user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new UnauthorizedError("Unauthorized"); });
    const username = "userToDelete";


    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  // 403 Forbidden
  it("delete user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => { throw new InsufficientRightsError("Forbidden"); });
    const username = "userToDelete";


    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Forbidden/);
  });

  // 404 Not Found
  it("delete user: 404 NotFound", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockImplementation(() => { throw new NotFoundError("User not found"); });
    const username = "userToDelete";


    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/User not found/);
  });

  // 500 Internal Server Error
  it("delete user: 500 error handler", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockImplementation(() => { throw new Error("fail"); });
    const username = "userToDelete";


    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/fail/);
  });
});

