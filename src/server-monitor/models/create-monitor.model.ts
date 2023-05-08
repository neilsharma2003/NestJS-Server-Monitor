import { Field, ID, Int, ObjectType, Scalar, registerEnumType } from '@nestjs/graphql';
import { HttpMethod } from '../entities/monitor.entity';

@ObjectType()
export class CreateMonitorModel {
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
}
