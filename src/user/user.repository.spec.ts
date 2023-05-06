import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { faker } from '@faker-js/faker'
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt'
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm';

describe('UserRepository', () => {
    let userRepository: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserRepository, {
                provide: getRepositoryToken(User),
                useValue: { getUserById: jest.fn(), createUser: jest.fn(), getAllUsers: jest.fn(), updateUser: jest.fn(), deleteUserById: jest.fn() }
            }],
        }).compile();
        userRepository = module.get<UserRepository>(UserRepository)
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(userRepository).toBeDefined()
    });

    describe('getUserById', () => {
        it('should return User entity', async () => {
            const expectedUser: User = { id: faker.datatype.uuid(), username: faker.name.firstName(), email: faker.internet.email(), password: faker.internet.password() }
            jest.spyOn(userRepository, 'getUserById').mockResolvedValue(expectedUser);

            const result = await userRepository.getUserById(expectedUser.id)
            expect(result).toBe(expectedUser)
        })

        it('should throw EntityNotFoundError when no user is found', async () => {
            expect(async () => await userRepository.getUserById(faker.datatype.uuid() + ' hello ')).rejects.toThrowError()
        })
    })

    describe('createUser', () => {
        const input: CreateUserDTO = {
            username: faker.internet.userName(), email: faker.internet.email(), password: faker.internet.password(),
        }
        const user: User = {
            id: faker.datatype.uuid(), ...input
        }

        it('should return User entity', async () => {

            jest.spyOn(userRepository, 'createUser').mockResolvedValue(user)
            const result = await userRepository.createUser(input)
            expect(user).toEqual(result);
        })

        it('should throw error with existing email or username', async () => {
            jest.spyOn(userRepository, 'getUserById').mockResolvedValue(user);

            expect(async () => await userRepository.createUser(input)).rejects.toThrow()
        })
    })

    describe('updateUser', () => {
        const updatedUser: UpdateUserDTO = {
            id: faker.datatype.uuid(),
            username: faker.internet.userName(),
            email: faker.internet.email()
        }

        it('should return User entity', async () => {
            const expectedUser: User = {
                id: updatedUser.id,
                username: updatedUser?.username as string,
                email: updatedUser?.email as string,
                password: await bcrypt.hash(faker.internet.password(), 10)
            }
            jest.spyOn(userRepository, 'updateUser').mockResolvedValue(expectedUser);

            const result = await userRepository.updateUser(expectedUser)
            expect(result).toBe(expectedUser)
        })

        it('should throw EntityNotFoundError when no user is found', async () => {
            const id = faker.datatype.uuid()
            jest.spyOn(userRepository, 'getUserById').mockRejectedValue(new EntityNotFoundError(User, id))

            expect(async () => await userRepository.updateUser(updatedUser)).rejects.toThrowError()
        })
    })

    describe('deleteUserById', () => {
        it('should return true', async () => {
            const id = faker.datatype.uuid()
            jest.spyOn(userRepository, 'deleteUserById').mockResolvedValue(true);

            const result = await userRepository.deleteUserById(id)
            expect(result).toBe(true)
        })

        it('should throw EntityNotFoundError when no user is found', async () => {
            const id = faker.datatype.uuid()
            jest.spyOn(userRepository, 'getUserById').mockRejectedValue(new EntityNotFoundError(User, id))
            expect(async () => await userRepository.deleteUserById(id)).rejects.toThrowError()
        })
    })

});