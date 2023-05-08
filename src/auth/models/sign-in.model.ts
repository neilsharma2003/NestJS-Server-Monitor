import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SignInModel {
    @Field()
    access_token: string
}