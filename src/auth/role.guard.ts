import { CanActivate, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Role } from "src/user/entities/user.entity";

export class RoleGuard implements CanActivate {
    public role: Role

    constructor(role: Role) {
        this.role = role
    }

    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context).getContext()
        const { role } = ctx.user
        return (role === this.role ? true : false)
    }
}