import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: { expiresIn: 300 }
  })],
  providers: [AuthResolver, AuthService],
  exports: [AuthService]
})
export class AuthModule { }
