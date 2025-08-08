import { generateToken, processToken } from "@services/authService";
import { UserType } from "@models/UserType";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { UserRepository } from "@repositories/UserRepository";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

const mockUser = {
  username: "testuser",
  type: UserType.Admin
};

const mockRepoWithAdmin = {
  getUserByUsername: async (username: string) => ({
    username,
    type: UserType.Admin
  })
} as unknown as UserRepository;

const mockRepoWithViewer = {
  getUserByUsername: async (username: string) => ({
    username,
    type: UserType.Viewer
  })
} as unknown as UserRepository;

const mockRepoFail = {
  getUserByUsername: async (username: string) => {
    throw new Error("User not found");
  }
} as unknown as UserRepository;


describe("generateToken", () => {
  it("should generate a JWT token", () => {
    (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");
    const token = generateToken(mockUser);
    expect(token).toBe("mocked-jwt-token");
  });
});


describe("processToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockReturnValue(mockUser); // jwt.verify ritorna mockUser
  });

  it("work without role restriction", async () => {
    await expect(processToken("Bearer token", [], mockRepoWithAdmin)).resolves.toBeUndefined();
  });

  it("work if user has allowed role", async () => {
    await expect(processToken("Bearer token", [UserType.Admin], mockRepoWithAdmin)).resolves.toBeUndefined();
  });

  it("throw if user has unauthorized role", async () => {
    await expect(processToken("Bearer token", [UserType.Admin], mockRepoWithViewer)).rejects.toThrow(InsufficientRightsError);
  });

  it("throw if user is not found", async () => {
    await expect(processToken("Bearer token", [], mockRepoFail)).rejects.toThrow(UnauthorizedError);
  });

  it("throw if token is missing", async () => {
    await expect(processToken(undefined, [], mockRepoWithAdmin)).rejects.toThrow(UnauthorizedError);
  });

  it("throw if token is malformed", async () => {
    await expect(processToken("Token abc", [], mockRepoWithAdmin)).rejects.toThrow(UnauthorizedError);
    await expect(processToken("BearerOnly", [], mockRepoWithAdmin)).rejects.toThrow(UnauthorizedError);
  });

  it("throw UnauthorizedError if jwt.verify fails with generic error", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid signature");
    });
    await expect(processToken("Bearer badtoken", [], mockRepoWithAdmin)).rejects.toThrow(UnauthorizedError);
  });

  it("rethrow existing AppError (UnauthorizedError)", async () => {
    const err = new UnauthorizedError("Already handled");
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw err;
    });
    await expect(processToken("Bearer error", [], mockRepoWithAdmin)).rejects.toThrow("Already handled");
  });
  
  it("should allow access when allowedRoles is empty", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ username: "testuser", type: UserType.Viewer });
    const repo = {
      getUserByUsername: async () => ({ username: "testuser", type: UserType.Viewer })
    } as unknown as UserRepository;

    await expect(processToken("Bearer token", [], repo)).resolves.toBeUndefined();
  });

  it("should allow access when user type is in allowedRoles", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ username: "testuser", type: UserType.Operator });
    const repo = {
      getUserByUsername: async () => ({ username: "testuser", type: UserType.Operator })
    } as unknown as UserRepository;

    await expect(processToken("Bearer token", [UserType.Admin, UserType.Operator], repo)).resolves.toBeUndefined();
  });

  it("should reject access when user type is not in allowedRoles", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ username: "testuser", type: UserType.Viewer });
    const repo = {
      getUserByUsername: async () => ({ username: "testuser", type: UserType.Viewer })
    } as unknown as UserRepository;

    await expect(processToken("Bearer token", [UserType.Admin, UserType.Operator], repo)).rejects.toThrow(InsufficientRightsError);
  });
  it("should allow access when allowedRoles is omitted", async () => {
  (jwt.verify as jest.Mock).mockReturnValue({ username: "testuser", type: UserType.Admin });

  const repo = {
    getUserByUsername: async () => ({ username: "testuser", type: UserType.Admin })
  } as unknown as UserRepository;

  await expect(
    // ✅ Ometti allowedRoles, attiva default []
    processToken("Bearer token", undefined, repo)
  ).resolves.toBeUndefined();
});


});


