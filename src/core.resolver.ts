import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class CoreResolver {
    @Query(() => String)
    get(): string {
        return "hello"
    }
}