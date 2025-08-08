import { UserRepository } from "@repositories/UserRepository";
import { User as UserDTO } from "@dto/User";
import { mapUserDAOToDTO } from "@services/mapperService";

const userRepo = new UserRepository();

export async function getAllUsers(): Promise<UserDTO[]> {
  return (await userRepo.getAllUsers()).map(mapUserDAOToDTO);
}

export async function getUser(username: string): Promise<UserDTO> {
  return mapUserDAOToDTO(await userRepo.getUserByUsername(username));
}

export async function createUser(userDto: UserDTO): Promise<void> {
  await userRepo.createUser(userDto.username, userDto.password, userDto.type);
}

export async function deleteUser(username: string): Promise<void> {
  await userRepo.deleteUser(username);
}