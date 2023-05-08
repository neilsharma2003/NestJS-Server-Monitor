import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ServerMonitorService } from "./server-monitor.service";
import { CreateMonitorModel } from "./models/create-monitor.model";
import { CreateServerMonitorInput } from "./inputs/create-server-monitor.input";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { User } from "src/user.decorator";
import { StartServerMonitorInput } from "./inputs/start-server-monitor.input";
import { StartMonitorModel } from "./models/start-monitor.model";
import { DeleteServerMonitorInput } from "./inputs/delete-server-monitor.input";

@Resolver()
export class ServerMonitorResolver {
    constructor(private readonly serverMonitorService: ServerMonitorService) { }

    @UseGuards(AuthGuard)
    @Mutation(() => CreateMonitorModel, { name: "createServerMonitor" })
    async createServerMonitor(@User() user: { username: string, sub: string, iat: number, exp: number }, @Args('input') input: CreateServerMonitorInput): Promise<CreateMonitorModel> {
        return await this.serverMonitorService.createServerMonitor(input, user.username)
    }

    @UseGuards(AuthGuard)
    @Mutation(() => StartMonitorModel, { name: "startServerMonitor" })
    async startServerMonitor(@Args('input') input: StartServerMonitorInput) {
        this.serverMonitorService.startCronJob()
        return await this.serverMonitorService.startServerMonitor(input)
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Boolean, { name: "stopServerMonitor" })
    async stopServerMonitor() {
        this.serverMonitorService.stopCronJob()
        return true
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Boolean, { name: "deleteServerMonitor" })
    async deleteServerMonitor(input: DeleteServerMonitorInput) {
        this.serverMonitorService.startCronJob()
        this.serverMonitorService.deleteServerMonitor(input)
        return true
    }
}