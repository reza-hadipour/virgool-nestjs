import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import { ROLE_KEY } from "src/common/decorators/role.decorator";
import { RolesEnum } from "src/common/enums/roles.enum";

@Injectable()
export class RoleGuard implements CanActivate{
    constructor(private reflector:Reflector){}

    async canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
            ROLE_KEY,
            [
            context.getHandler(),
            context.getClass()
            ]
        );

        if(!requiredRoles || requiredRoles.length == 0) return true;

        const request = context.switchToHttp().getRequest<Request>()
        const user = request.user;
        const userRole = user?.role ?? RolesEnum.USER;

        if(userRole === RolesEnum.ADMIN) return true;

        if(requiredRoles.includes(userRole as RolesEnum || RolesEnum.USER)) return true
        
        throw new ForbiddenException("Access Denied.")
    }
}