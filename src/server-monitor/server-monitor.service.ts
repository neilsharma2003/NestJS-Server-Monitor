import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ServerMonitorRepository } from "./server-monitor.repository";
import { Cron, CronExpression } from "@nestjs/schedule";
import { fetchServer } from "./server-monitor-helper";
import { CreateServerMonitorDTO, createServerMonitorDTOSchema } from "./dtos/create-server-monitor.dto";
import * as Joi from "joi";
import { StartServerMonitorDTO, startServerMonitorDTOSchema } from "./dtos/start-server-monitor.dto";
import { DeleteServerMonitorDTO, deleteServerMonitorDTOSchema } from "./dtos/delete-server-monitor.dto";
import { EmailService } from "src/notification/email.service";
import { UserService } from "src/user/user.service";


@Injectable()
export class ServerMonitorService {
    constructor(
        private readonly serverMonitorRepository: ServerMonitorRepository,
        private readonly emailService: EmailService,
        private readonly userService: UserService) { }
    private cronJobFlag: boolean = false
    private cronIsRunning: boolean = false

    startCronJob() {
        this.cronJobFlag = true
    }

    stopCronJob() {
        this.cronJobFlag = false
    }

    async getServerMonitor(input: StartServerMonitorDTO) {
        Joi.attempt(input, startServerMonitorDTOSchema)
        return await this.serverMonitorRepository.getServerMonitor(input)
    }

    async createServerMonitor(input: CreateServerMonitorDTO, username: string) {
        Joi.attempt(input, createServerMonitorDTOSchema)
        // check if monitor exists and throw on repo level
        return await this.serverMonitorRepository.createServerMonitor(input, username)
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async startServerMonitor(input: StartServerMonitorDTO) {
        if ((input && this.cronJobFlag) || this.cronIsRunning) {
            try {
                Joi.attempt(input, startServerMonitorDTOSchema)
                const { endpoint, request_options } = await this.getServerMonitor(input)
                const response = await fetchServer({ endpoint, options: request_options })

                this.serverMonitorRepository.startCronJob(input)

                const dateStamp = (new Date).toISOString()
                const currentState = (await this.getServerMonitor(input)).desired_status_code === response.status ? "AVAILABLE" : "UNAVAILABLE"

                const monitor = await this.serverMonitorRepository.startServerMonitor(input, dateStamp, currentState)
                this.cronIsRunning = true
                console.log({ currentStatusCode: response.status, currentState, dateStamp })


                const email = (await this.userService.getUserById(monitor.id)).email
                this.emailService.sendErrorEmail(monitor.monitor_name, email, monitor.endpoint, response.status)
                return {
                    resourceId: monitor.resource_id,
                    monitorName: monitor.monitor_name,
                    desiredStatusCode: monitor.desired_status_code,
                    method: monitor.method,
                    cronJobStarted: monitor.is_cron_job_started,
                    currentStatusCode: response.status
                }
            }

            catch (err) {
                if (Joi.isError(err)) throw err
                else {
                    this.stopCronJob()
                    this.serverMonitorRepository.stopCronJob(input)
                    throw err
                }
            }
        }

    }

    async deleteServerMonitor(input: DeleteServerMonitorDTO) {
        Joi.attempt(input, deleteServerMonitorDTOSchema)
        this.serverMonitorRepository.deleteServerMonitor(input)
    }
}
