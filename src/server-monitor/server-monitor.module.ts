import { Module } from "@nestjs/common";
import { ServerMonitorService } from "./server-monitor.service";
import { ServerMonitorRepository } from "./server-monitor.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServerMonitorResolver } from "./server-monitor.resolver";
import { Monitor } from "./entities/monitor.entity";
import { User } from "../user/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Monitor, User])],
    providers: [ServerMonitorResolver, ServerMonitorService, ServerMonitorRepository]
})
export class ServerMonitorModule { }