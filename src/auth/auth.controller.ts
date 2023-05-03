import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as Joi from 'joi';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDTO: { username: string, password: string }) {
        Joi.attempt(signInDTO, Joi.object({ username: Joi.string().required(), password: Joi.string().required() }))
        return this.authService.signIn(signInDTO.username, signInDTO.password)
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() req: any) {
        return req.user
    }
}
