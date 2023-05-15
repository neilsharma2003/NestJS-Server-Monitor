import { AuthService } from './auth.service';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SignInInput } from './inputs/sign-in.input';
import { SignInModel } from './models/sign-in.model';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) { }

    @Mutation(() => SignInModel, { name: "signIn" })
    async signIn(@Args('input') input: SignInInput) {
        return await this.authService.signIn(input)
    }
}
