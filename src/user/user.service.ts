import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDTO, createUserDTOSchema } from './dtos/create-user.dto';
import * as Joi from 'joi';
import { UpdateUserDTO, updateUserDTOSchema } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) { }
  async getUserById(id: string) {
    Joi.attempt(id, Joi.string().uuid())
    return this.userRepository.getUserById(id);
  }

  async createUser(input: CreateUserDTO) {
    Joi.attempt(input, createUserDTOSchema)
    input.password = await bcrypt.hash(input.password, 10)
    return this.userRepository.createUser(input);
  }

  async getAllUsers() {
    return this.userRepository.getAllUsers()
  }

  async updateUser(input: UpdateUserDTO) {
    if (input?.password) input.password = await bcrypt.hash(input.password, 10)
    Joi.attempt(input, updateUserDTOSchema)
    return this.userRepository.updateUser(input)
  }

  async deleteUserById(id: string) {
    Joi.attempt(id, Joi.string().uuid())
    return this.userRepository.deleteUserById(id)
  }
}
