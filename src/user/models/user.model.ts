import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: UUID;
  @Field()
  username: string;
  @Field()
  email: string;
}
