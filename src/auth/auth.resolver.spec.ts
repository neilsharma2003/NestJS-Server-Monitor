import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role, User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';


describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        AuthService,
        JwtService,
        AuthGuard,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    const signInDTO = { username: faker.internet.userName(), password: faker.internet.password() };
    const user: User = { id: faker.datatype.uuid(), ...signInDTO, email: faker.internet.email(), role: Role.User, monitors: [] };

    it('should return access token upon successful login', async () => {
      const expectedPayload = { username: signInDTO.username, sub: user.id };
      const expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(expectedToken);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true))


      const result = await authResolver.signIn(signInDTO);

      expect(result).toEqual({ access_token: expectedToken });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: signInDTO.username } });
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw validation error with missing required field(s)', async () => {
      expect(async () => await authResolver.signIn({ username: signInDTO.username } as { username: string, password: string })).rejects.toThrowError();
    })
  })
})  