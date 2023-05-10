import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from './entities/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create-user.dto';
import { v4 as UUIDv4 } from 'uuid';
import { UpdateUserDTO, updateUserDTOSchema } from './dtos/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }
  async getUserById(id: string): Promise<User> {
    const user: User | null = await this.userRepository.findOneBy({
      id: id,
    });
    if (!user) throw new EntityNotFoundError(User, id);
    return user;
  }

  async createUser(input: CreateUserDTO): Promise<User> {
    if (await this.userRepository.findOneBy({ username: input.username }) || await this.userRepository.findOneBy({ email: input.email })) {
      throw new Error('Username or email already exists')
    }

    const user = await this.userRepository.create({
      id: UUIDv4(),
      username: input.username,
      email: input.email,
      password: input.password,
      role: Role.User
    });

    await this.userRepository.save(user)
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find()
  }

  async updateUser(input: UpdateUserDTO): Promise<User> {
    const foundUser = await this.getUserById(input.id)

    if (foundUser) {
      await this.userRepository.update(input.id, {
        email: input?.email || foundUser.email, username: input?.username ||
          foundUser.username, password: input?.password || foundUser.password
      })
      return await this.getUserById(input.id)
    }
    throw new EntityNotFoundError(User, input.id);
  }

  async deleteUserById(id: string) {
    if (await this.getUserById(id)) throw new EntityNotFoundError(User, id);
    await this.userRepository.delete({ id: id })
    return true
  }
}
