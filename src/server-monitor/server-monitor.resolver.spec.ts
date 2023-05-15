import { Test, TestingModule } from '@nestjs/testing';
import { ServerMonitorResolver } from './server-monitor.resolver';
import { ServerMonitorService } from './server-monitor.service';
import { Role, User } from '../user/entities/user.entity';
import { HttpMethod, Monitor } from './entities/monitor.entity';
import { faker } from '@faker-js/faker';
import { EmailService } from '../notification/email.service';
import { UserService } from '../user/user.service';
import { ServerMonitorRepository } from './server-monitor.repository';
import { UserRepository } from '../user/user.repository';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

describe('ServerMonitorResolver', () => {
    let serverMonitorResolver: ServerMonitorResolver;
    let serverMonitorService: ServerMonitorService;
    let serverMonitorRepository: ServerMonitorRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServerMonitorResolver,
                ServerMonitorService,
                ServerMonitorRepository,
                EmailService,
                UserService,
                UserRepository,
                JwtService,
                {
                    provide: getRepositoryToken(Monitor),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        serverMonitorResolver = module.get<ServerMonitorResolver>(ServerMonitorResolver);
        serverMonitorService = module.get<ServerMonitorService>(ServerMonitorService);
        serverMonitorRepository = module.get<ServerMonitorRepository>(ServerMonitorRepository);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(serverMonitorResolver).toBeDefined();
        expect(serverMonitorService).toBeDefined();
        expect(serverMonitorRepository).toBeDefined();
    });

    describe('createServerMonitor', () => {
        it('should create a server monitor', async () => {
            const user = { username: 'testuser', role: Role.User, sub: '123', iat: 1234567890, exp: 1234567890 };
            const input = { monitorName: "monitor", endpoint: "http://www.google.com", desiredStatusCode: 200 }

            const expectedResult = {
                monitorName: "monitor",
                method: HttpMethod.GET,
                resourceId: faker.datatype.uuid(),
                desiredStatusCode: 200,
                cronJobStarted: false,
            };

            jest.spyOn(serverMonitorService, 'createServerMonitor').mockResolvedValue(expectedResult);

            const result = await serverMonitorResolver.createServerMonitor(user, input);

            expect(result).toEqual(expectedResult);
            expect(serverMonitorService.createServerMonitor).toHaveBeenCalledWith(input, user.username);
        });
    });

    describe('startServerMonitor', () => {
        it('should start the server monitor', async () => {
            const input = { resourceId: faker.datatype.uuid() }

            const expectedResult = {
                monitorName: "monitor", resourceId: input.resourceId, desiredStatusCode: 200,
                method: HttpMethod.GET,
                cronJobStarted: true,
                currentStatusCode: 200
            };

            jest.spyOn(serverMonitorService, 'startServerMonitor').mockResolvedValue(expectedResult);

            const result = await serverMonitorResolver.startServerMonitor(input);

            expect(result).toEqual(expectedResult);
            expect(serverMonitorService.startServerMonitor).toHaveBeenCalledWith(input);
        });
    });

    describe('stopServerMonitor', () => {
        it('should stop the server monitor', async () => {
            jest.spyOn(serverMonitorService, 'stopCronJob');

            const result = await serverMonitorResolver.stopServerMonitor();

            expect(result).toBe(true);
            expect(serverMonitorService.stopCronJob).toHaveBeenCalled();
        });
    });

    describe('deleteServerMonitor', () => {
        it('should delete the server monitor', async () => {
            const input = { resourceId: faker.datatype.uuid() };

            jest.spyOn(serverMonitorService, 'startCronJob');
            jest.spyOn(serverMonitorService, 'deleteServerMonitor');
            jest.spyOn(serverMonitorRepository, 'deleteServerMonitor').mockImplementationOnce(() => Promise.resolve())

            const result = await serverMonitorResolver.deleteServerMonitor(input);

            expect(result).toBe(true);
            expect(serverMonitorService.startCronJob).toHaveBeenCalled();
            expect(serverMonitorService.deleteServerMonitor).toHaveBeenCalledWith(input);
        });
    });
});
