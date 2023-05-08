import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Monitor } from "./entities/monitor.entity";
import { EntityNotFoundError, Repository } from "typeorm";
import { v4 as UUIDv4 } from 'uuid'
import { CreateServerMonitorDTO } from "./dtos/create-server-monitor.dto";
import { User } from "../user/entities/user.entity";
import { StartServerMonitorDTO } from "./dtos/start-server-monitor.dto";
import { DeleteServerMonitorDTO } from "./dtos/delete-server-monitor.dto";

@Injectable()
export class ServerMonitorRepository {
    constructor(
        @InjectRepository(Monitor) private readonly monitorRepository: Repository<Monitor>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) { }

    async startCronJob(input: StartServerMonitorDTO): Promise<void> {
        const foundMonitor = await this.getServerMonitor(input)
        await this.monitorRepository.update(foundMonitor.resource_id, { is_cron_job_started: true })
    }

    async stopCronJob(input: StartServerMonitorDTO): Promise<void> {
        const foundMonitor = await this.getServerMonitor(input)
        await this.monitorRepository.update(foundMonitor.resource_id, { is_cron_job_started: false })
    }

    async getServerMonitor(input: StartServerMonitorDTO): Promise<Monitor> {
        const foundByMonitorName = await this.monitorRepository.findOne({
            where: {
                monitor_name: input?.monitorName
            }
        })

        const foundByResourceId = await this.monitorRepository.findOne({
            where: {
                resource_id: input?.resourceId
            }
        })
        if (foundByMonitorName) return foundByMonitorName
        if (foundByResourceId) return foundByResourceId

        throw new EntityNotFoundError(Monitor, input?.monitorName || input?.resourceId)
    }

    async createServerMonitor(input: CreateServerMonitorDTO, username: string) {
        const foundUser: User | null = await this.userRepository.findOne({
            where: {
                username: username
            }
        })

        if (!foundUser) throw new EntityNotFoundError(User, username)

        const monitor: Monitor = await this.monitorRepository.create({
            resource_id: UUIDv4(),
            monitor_name: input.monitorName,
            desired_status_code: input.desiredStatusCode,
            endpoint: input.endpoint,
            method: input?.options ? JSON.parse(input?.options)?.method : "GET",
            is_cron_job_started: false,
            request_options: input?.options ? JSON.stringify(input?.options) : undefined,
            id: foundUser.id,
            cron_timestamps: '[]',
            current_cron_state: '[]'
        })
        await this.monitorRepository.save(monitor)
        return { monitorName: monitor.monitor_name, method: monitor.method, resourceId: monitor.resource_id, desiredStatusCode: monitor.desired_status_code, cronJobStarted: monitor.is_cron_job_started }
    }

    async startServerMonitor(input: StartServerMonitorDTO, dateStamp: string, currentState: string) {
        this.startCronJob(input)
        const monitor = await this.getServerMonitor(input)
        let dateStamps: string[] = JSON.parse(monitor.cron_timestamps)
        let currentCronStates: string[] = JSON.parse(monitor.current_cron_state)

        dateStamps.push(dateStamp)
        currentCronStates.push(currentState)

        this.monitorRepository.update(monitor.resource_id, {
            cron_timestamps: JSON.stringify(dateStamps),
            current_cron_state: JSON.stringify(currentCronStates)
        })

        return await this.getServerMonitor(input)
    }

    async deleteServerMonitor(input: DeleteServerMonitorDTO) {
        this.getServerMonitor(input)
        this.monitorRepository.delete(input?.monitorName || input?.resourceId as string)
    }
}