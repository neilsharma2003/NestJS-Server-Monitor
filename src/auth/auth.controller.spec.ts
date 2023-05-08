import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';


describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        AuthGuard,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    const signInDTO = { username: faker.internet.userName(), password: faker.internet.password() };
    const user = { id: faker.datatype.uuid(), ...signInDTO, email: faker.internet.email() };

    it('should return access token upon successful login', async () => {
      const expectedPayload = { username: signInDTO.username, sub: user.id };
      const expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(expectedToken);

      const result = await controller.signIn(signInDTO);

      expect(result).toEqual({ access_token: expectedToken });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: signInDTO.username } });
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
    });

    it('should throw validation error with missing required field(s)', async () => {
      expect(async () => await controller.signIn({ username: signInDTO.username } as { username: string, password: string })).rejects.toThrowError();
    })
  })
})  