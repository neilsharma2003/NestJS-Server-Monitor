import { EntityNotFoundError, Repository, UpdateResult } from "typeorm";
import { ServerMonitorRepository } from "./server-monitor.repository";
import { Monitor } from "./entities/monitor.entity";
import { User } from "../user/entities/user.entity";
import { faker } from "@faker-js/faker";
import { HttpMethod } from "./entities/monitor.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test } from "@nestjs/testing";

describe("ServerMonitorRepository", () => {
    let serverMonitorRepository: ServerMonitorRepository;
    let monitorRepository: Repository<Monitor>;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                ServerMonitorRepository,
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

        serverMonitorRepository = moduleRef.get<ServerMonitorRepository>(
            ServerMonitorRepository
        );
        monitorRepository = moduleRef.get<Repository<Monitor>>(
            getRepositoryToken(Monitor)
        );
        userRepository = moduleRef.get<Repository<User>>(
            getRepositoryToken(User)
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(serverMonitorRepository).toBeDefined();
    });

    const foundMonitor: Monitor = {
        monitor_name: "monitor",
        desired_status_code: 200,
        method: HttpMethod.GET,
        endpoint: faker.internet.url(),
        resource_id: faker.datatype.uuid(),
        is_cron_job_started: false,
        cron_timestamps: '[]',
        current_cron_state: '[]',
        user: {} as User,
        id: faker.datatype.uuid()
    };

    describe("startCronJob", () => {
        it("should start the cron job for the server monitor", async () => {
            const input = { monitorName: "TestMonitor" };
            jest.spyOn(monitorRepository, 'findOne').mockResolvedValue(foundMonitor);
            jest.spyOn(monitorRepository, 'update').mockImplementation()
            jest.spyOn(serverMonitorRepository, "getServerMonitor").mockResolvedValue(foundMonitor);

            await serverMonitorRepository.startCronJob(input);
            expect(monitorRepository.update).toHaveBeenCalled()
        });
    });

    describe("stopCronJob", () => {
        it("should stop the cron job for the server monitor", async () => {
            const input = { monitorName: "TestMonitor" };
            jest.spyOn(monitorRepository, 'findOne').mockResolvedValue(foundMonitor);
            jest.spyOn(monitorRepository, 'update').mockImplementation()

            await serverMonitorRepository.stopCronJob(input);

            expect(monitorRepository.findOne).toHaveBeenCalled()
        });
    });

    describe("getServerMonitor", () => {
        it("should return the server monitor by monitor name", async () => {
            const input = { monitorName: "TestMonitor" };
            jest.spyOn(monitorRepository, 'findOne').mockResolvedValue(foundMonitor);

            const result = await serverMonitorRepository.getServerMonitor(input);
            expect(result).toBe(foundMonitor);
        });

        it("should return the server monitor by resource ID", async () => {
            const input = { resourceId: faker.datatype.uuid() };

            jest.spyOn(monitorRepository, 'findOne').mockResolvedValue(foundMonitor);

            const result = await serverMonitorRepository.getServerMonitor(input);
            expect(result).toBe(foundMonitor);
        });

        it("should throw an EntityNotFoundError if the server monitor is not found", async () => {
            const input = { monitorName: "NonExistentMonitor" };

            jest.spyOn(monitorRepository, 'findOne').mockResolvedValue(null);

            await expect(
                serverMonitorRepository.getServerMonitor(input)
            ).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe("createServerMonitor", () => {
        it("should create a new server monitor", async () => {
            const input = {
                monitorName: "TestMonitor",
                desiredStatusCode: 200,
                endpoint: "http://test.com",
                options: JSON.stringify({ method: "GET" }),
            };
            const username = "testUser";

            jest.spyOn(monitorRepository, 'findOne').mockResolvedValue(foundMonitor);

            const createdMonitor: Monitor = {
                resource_id: faker.datatype.uuid(),
                monitor_name: "TestMonitor",
                desired_status_code: 200,
                endpoint: "http://test.com",
                method: HttpMethod.GET,
                is_cron_job_started: false,
                request_options: JSON.stringify({ method: "GET" }),
                id: faker.datatype.uuid(),
                cron_timestamps: "[]",
                current_cron_state: "[]",
                user: {} as User
            }

            jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: faker.datatype.uuid() } as User);
            jest.spyOn(monitorRepository, 'save').mockResolvedValue(createdMonitor);
            jest.spyOn(monitorRepository, 'create').mockReturnValue(createdMonitor);

            const result = await serverMonitorRepository.createServerMonitor(
                input,
                username
            );

            expect(monitorRepository.create).toHaveBeenCalledWith({
                resource_id: expect.any(String),
                monitor_name: "TestMonitor",
                desired_status_code: 200,
                endpoint: "http://test.com",
                method: "GET",
                is_cron_job_started: false,
                request_options: expect.any(String),
                id: expect.any(String),
                cron_timestamps: "[]",
                current_cron_state: "[]",
            });

            expect(monitorRepository.save).toHaveBeenCalledWith(createdMonitor);
            expect(result).toEqual({
                monitorName: "TestMonitor",
                method: "GET",
                resourceId: createdMonitor.resource_id,
                desiredStatusCode: 200,
                cronJobStarted: false,
            });
        });

        it("should throw an EntityNotFoundError if the user is not found", async () => {
            const input = {
                monitorName: "TestMonitor",
                desiredStatusCode: 200,
                endpoint: "http://test.com",
                options: JSON.stringify({ method: "GET" }),
            };
            const username = "nonExistentUser";

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(
                serverMonitorRepository.createServerMonitor(input, username)
            ).rejects.toThrow(EntityNotFoundError);
        });
    });
})