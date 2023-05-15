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
import { StartServerMonitorDTO } from './dtos/start-server-monitor.dto';
import { CreateServerMonitorDTO } from './dtos/create-server-monitor.dto';
import { create } from 'domain';

describe('ServerMonitorResolver', () => {
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

        serverMonitorService = module.get<ServerMonitorService>(ServerMonitorService);
        serverMonitorRepository = module.get<ServerMonitorRepository>(ServerMonitorRepository);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(serverMonitorService).toBeDefined();
        expect(serverMonitorRepository).toBeDefined()
    });

    const input: StartServerMonitorDTO = { resourceId: faker.datatype.uuid() }

    const expectedResult: Monitor = {
        resource_id: input.resourceId as string,
        monitor_name: "Monitor name",
        desired_status_code: 200,
        endpoint: faker.internet.url(),
        method: HttpMethod.GET,
        cron_timestamps: '[]',
        current_cron_state: '[]',
        is_cron_job_started: true,
        user: {} as User,
        id: faker.datatype.uuid(),
    }

    describe('getServerMonitor', () => {

        it('should return a Monitor entity', async () => {
            jest.spyOn(serverMonitorRepository, 'getServerMonitor').mockResolvedValue(expectedResult)
            const actualResult = await serverMonitorService.getServerMonitor(input)

            expect(actualResult).toEqual(expectedResult)
        })

        it('should throw validation error with invalid input', async () => {
            expect(async () => serverMonitorService.getServerMonitor({ resourceId: faker.datatype.uuid() + 'random suffix' })).rejects.toThrowError()
            expect(async () => serverMonitorService.getServerMonitor({ nonsenseField: "string" } as StartServerMonitorDTO)).rejects.toThrowError()
        })
    })

    describe('startServerMonitor', () => {
        it('should return an object containing data about started server monitor', async () => {
            const expectedServiceResult = {
                resourceId: input.resourceId as string,
                monitorName: "Monitor name",
                desiredStatusCode: 200,
                method: HttpMethod.GET,
                cronJobStarted: true,
                currentStatusCode: 200
            }

            jest.spyOn(serverMonitorRepository, 'startServerMonitor').mockResolvedValue(expectedResult)
            jest.spyOn(serverMonitorService, 'startServerMonitor').mockResolvedValue(expectedServiceResult)

            const actualServiceResult = await serverMonitorService.startServerMonitor(input)

            expect(actualServiceResult).toBe(expectedServiceResult)
        })
    })

    describe('createServerMonitor', () => {
        it('should return an object containing data about started server monitor', async () => {
            const createInput: CreateServerMonitorDTO = {
                monitorName: "Monitor name",
                endpoint: faker.internet.url(),
                desiredStatusCode: 200
            }

            const repositoryResult = { monitorName: "Monitor name", method: HttpMethod.GET, resourceId: input.resourceId as string, desiredStatusCode: 200, cronJobStarted: false }

            jest.spyOn(serverMonitorRepository, 'createServerMonitor').mockResolvedValue(repositoryResult as { monitorName: string; method: HttpMethod; resourceId: string; desiredStatusCode: number; cronJobStarted: boolean; })
            expect(await serverMonitorService.createServerMonitor(createInput, faker.internet.userName())).toBe(repositoryResult)
        })
    })

})