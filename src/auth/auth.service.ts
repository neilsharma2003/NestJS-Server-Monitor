import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    async signIn(username: string, password: string) {
        const user = await this.userRepository.findOne({
            where: {
                username: username
            }
        })
        if (user) {
            await bcrypt.compare(password, user.password)
            const payload = { username: user.username, sub: user.id }
            return {
                access_token: await this.jwtService.signAsync(payload)
            }
        }
        throw new EntityNotFoundError(User, username)
    }
}
