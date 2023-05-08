import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class StartServerMonitorInput {
    @Field({ nullable: true })
    monitorName?: string
    @Field(() => ID, { nullable: true })
    resourceId?: string
}