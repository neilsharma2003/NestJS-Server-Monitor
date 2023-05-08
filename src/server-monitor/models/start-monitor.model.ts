
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { CreateMonitorModel } from './create-monitor.model';
import { HttpMethod } from '../entities/monitor.entity';

@ObjectType()
export class StartMonitorModel extends CreateMonitorModel {
    @Field(() => ID)
    resourceId: string;
    @Field()
    monitorName: string
    @Field(() => Int)
    desiredStatusCode: number;
    @Field()
    method: HttpMethod
    @Field()
    cronJobStarted: boolean
    @Field(() => Int)
    currentStatusCode: number
}
