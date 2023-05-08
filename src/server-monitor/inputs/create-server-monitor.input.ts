import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateServerMonitorInput {
    @Field()
    monitorName: string
    @Field()
    endpoint: string
    @Field(() => Int)
    desiredStatusCode: number
    @Field({ nullable: true })
    options?: string
}