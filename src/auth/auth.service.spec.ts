import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SignInDTO } from './dtos/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { EntityNotFoundError } from 'typeorm';
import { faker } from '@faker-js/faker';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fake-access-token'),
          },
        },
      ],
    }).compile();


    authService = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('signIn', () => {
    const mockUser: User = {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      username: 'testuser',
      password: '',
      role: Role.User,
      monitors: []
    };

    it('should sign in a user and return an access token', async () => {
      mockUser.password = await bcrypt.hash('password', 10)
      const signInDTO: SignInDTO = {
        username: 'testuser',
        password: 'password',
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(mockUser as User);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true))

      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      const result = await authService.signIn(signInDTO);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          username: 'testuser',
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password
      );

      expect(signAsyncSpy).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
      });

      expect(result).toEqual({ access_token: 'fake-access-token' });
    });

    it('should throw an error if the user does not exist', async () => {
      const signInDTO: SignInDTO = {
        username: 'testuser',
        password: 'password',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(authService.signIn(signInDTO)).rejects.toThrow(
        new EntityNotFoundError(User, 'testuser')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          username: 'testuser',
        },
      });
    });

    it('should throw an error if the password is incorrect', async () => {
      const signInDTO: SignInDTO = {
        username: 'testuser',
        password: 'wrong-password',
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(mockUser);

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      await expect(authService.signIn(signInDTO)).rejects.toThrowError('Incorrect password')
    })


  })
})