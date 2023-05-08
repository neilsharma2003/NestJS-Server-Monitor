import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class DeleteServerMonitorInput {
    @Field({ nullable: true })
    monitorName?: string
    @Field({ nullable: true })
    resourceId?: string
}