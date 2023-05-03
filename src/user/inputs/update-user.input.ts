import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
    @Field({ nullable: false })
    id: string;
    @Field({ nullable: true })
    username?: string;
    @Field({ nullable: true })
    email?: string;
    @Field({ nullable: true })
    password?: string;
}
