import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity'
import { EntityNotFoundError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import * as Joi from 'joi';
import { SignInDTO, signInDTOSchema } from './dtos/sign-in.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    async signIn(input: SignInDTO) {
        Joi.attempt(input, signInDTOSchema)
        const { username, password } = input
        const user = await this.userRepository.findOne({
            where: {
                username: username
            }
        })
        if (user) {
            const isValid: boolean = await bcrypt.compare(password, user.password)
            if (!isValid) throw new Error('Incorrect password')
            const payload = { username: user.username, sub: user.id, role: user.role }
            return {
                access_token: await this.jwtService.signAsync(payload)
            }
        }
        throw new EntityNotFoundError(User, username)
    }
}
