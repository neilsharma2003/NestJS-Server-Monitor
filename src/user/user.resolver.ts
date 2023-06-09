import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserModel } from './models/user.model';
import { UserService } from './user.service';
import { Role, User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) { }
    @UseGuards(AuthGuard, new RoleGuard(Role.Admin))
    @Query(() => UserModel, { name: 'getUserById' })
    async getUserById(@Args('id', { type: () => ID }) id: string): Promise<User> {
        return this.userService.getUserById(id);
    }

    @Mutation(() => UserModel, { name: 'createUser' })
    async createUser(@Args('input', { nullable: false }) input: CreateUserInput): Promise<User> {
        return this.userService.createUser(input);
    }

    @UseGuards(AuthGuard, new RoleGuard(Role.Admin))
    @Query(() => [UserModel], { name: 'getAllUsers' })
    async getAllUsers(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @UseGuards(AuthGuard, new RoleGuard(Role.User))
    @Mutation(() => UserModel, { name: 'updateUser' })
    async updateUser(@Args('input', { nullable: false }) input: UpdateUserInput) {
        return this.userService.updateUser(input)
    }

    @UseGuards(AuthGuard, new RoleGuard(Role.Admin))
    @Mutation(() => Boolean, { name: 'deleteUserById' })
    async deleteUserById(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        return this.userService.deleteUserById(id)
    }
}
