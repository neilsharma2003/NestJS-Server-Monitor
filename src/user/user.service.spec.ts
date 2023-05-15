import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { faker } from '@faker-js/faker'
import { Role, User } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import * as Joi from 'joi';
import { UpdateUserDTO } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt'

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserService, {
                provide: UserRepository,
                useValue: { getUserById: jest.fn(), createUser: jest.fn(), getAllUsers: jest.fn(), updateUser: jest.fn(), deleteUserById: jest.fn() }
            }],
        }).compile();
        userService = module.get<UserService>(UserService);
        userRepository = module.get<UserRepository>(UserRepository)
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
        expect(userRepository).toBeDefined()
    });

    describe('getUserById', () => {
        it('should return User entity', async () => {
            const expectedUser: User = { id: faker.datatype.uuid(), username: faker.name.firstName(), email: faker.internet.email(), password: faker.internet.password(), role: Role.User, monitors: [] }
            const userRepositoryGetUserByIdSpy = jest.spyOn(userRepository, 'getUserById').mockResolvedValue(expectedUser);

            const result = await userService.getUserById(expectedUser.id)
            expect(result).toBe(expectedUser)
            expect(userRepositoryGetUserByIdSpy).toHaveBeenCalledWith(expectedUser.id);
        })

        it('should throw validation error with invalid UUID string', async () => {
            expect(async () => await userService.getUserById(faker.datatype.uuid() + ' hello ')).rejects.toThrowError()
        })
    })

    describe('createUser', () => {
        it('should return User entity', async () => {
            const password = faker.internet.password()
            const input: CreateUserDTO = {
                username: faker.internet.userName(), email: faker.internet.email(), password: password, confirmPassword: password,
            }
            const actualUser = await userService.createUser(input)
            const bcryptRegex = new RegExp('^\$2y\$.{56}$')

            expect(Joi.attempt(actualUser, Joi.object({
                id: Joi.string().uuid().required(),
                email: Joi.string().email().required(),
                username: Joi.string().required(),
                password: Joi.string().regex(bcryptRegex).required(),
            }))).toBe(actualUser)
        })

        it('should throw validation error with invalid email', async () => {
            const password = faker.internet.password()
            const input: CreateUserDTO = {
                username: faker.internet.userName(), email: "not a valid email", password: password, confirmPassword: password,
            }
            expect(async () => await userService.createUser(input)).rejects.toThrow()
        })
    })

    describe('getAllUsers', () => {
        it("should return array of User entity", async () => {
            const users: User[] = []
            for (let i = 0; i < 40; i++) {
                const pass = await bcrypt.hash(faker.internet.password(), 10)
                users.push({
                    id: faker.datatype.uuid(),
                    username: faker.internet.userName(),
                    email: faker.internet.email(),
                    password: pass,
                    role: Role.User,
                    monitors: []
                })
            }
            jest.spyOn(userService, 'getAllUsers').mockImplementation(async () => users);
            expect(await userService.getAllUsers()).toEqual(users)
        })
    })

    describe('updateUser', () => {
        it('should return User entity', async () => {
            const updatedUser: UpdateUserDTO = {
                id: faker.datatype.uuid(),
                username: faker.internet.userName(),
                email: faker.internet.email()
            }

            const expectedUser: User = {
                id: updatedUser.id,
                username: updatedUser?.username as string,
                email: updatedUser?.email as string,
                password: await bcrypt.hash(faker.internet.password(), 10),
                role: Role.User,
                monitors: []
            }
            const userRepositoryUpdateUserSpy = jest.spyOn(userRepository, 'updateUser').mockResolvedValue(expectedUser);

            const result = await userService.updateUser(updatedUser)
            expect(result).toBe(expectedUser)
            expect(userRepositoryUpdateUserSpy).toHaveBeenCalledWith(updatedUser);
        })
    })

    describe('deleteUserById', () => {
        it('should return true', async () => {
            const id = faker.datatype.uuid()
            jest.spyOn(userRepository, 'deleteUserById').mockResolvedValue(true);

            const result = await userService.deleteUserById(id)
            expect(result).toBe(true)
            expect(userRepository.deleteUserById).toHaveBeenCalledWith(id);
        })

        it('should throw validation error with invalid UUID string', async () => {
            expect(async () => await userService.deleteUserById(faker.datatype.uuid() + ' hello ')).rejects.toThrowError()
        })
    })

});