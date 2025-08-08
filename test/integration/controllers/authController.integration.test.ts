import * as authController from "@controllers/authController";
import { UserRepository } from "@repositories/UserRepository";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { generateToken } from "@services/authService";
import { createTokenDTO,createUserDTO } from "@services/mapperService";
import { UserType } from "@models/UserType";


jest.mock("@repositories/UserRepository");
jest.mock("@services/authService");
jest.mock("@services/mapperService");

describe("authController", () => {
  const fakeUserDTO = {
    username: "john",
    password: "securepass",
    type: UserType.Admin
  };

  const fakeUserDAO = {
    username: "john",
    password: "securepass",
    type: UserType.Admin
  };

  const fakeToken = "token123";
  const fakeTokenDTO = { token: fakeToken };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getToken - success", async () => {
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(fakeUserDAO)
    }));
    (createUserDTO as jest.Mock).mockReturnValue(fakeUserDAO);
    (generateToken as jest.Mock).mockReturnValue(fakeToken);
    (createTokenDTO as jest.Mock).mockReturnValue(fakeTokenDTO);

    const result = await authController.getToken(fakeUserDTO);
    expect(result).toEqual(fakeTokenDTO);
    expect(createUserDTO).toHaveBeenCalledWith("john", "admin", "securepass");
    expect(generateToken).toHaveBeenCalledWith(fakeUserDAO);
    expect(createTokenDTO).toHaveBeenCalledWith(fakeToken);
  });

  it("getToken - invalid password", async () => {
    const wrongPasswordUserDTO = { ...fakeUserDTO, password: "wrongpass" };

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(fakeUserDAO)
    }));

    await expect(authController.getToken(wrongPasswordUserDTO))
      .rejects
      .toThrow(UnauthorizedError);
  });
});