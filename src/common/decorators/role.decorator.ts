import { SetMetadata } from "@nestjs/common";
import { RolesEnum } from "../enums/roles.enum";

export const ROLE_KEY = "ROLE";
export const CanAccess = (...roles: RolesEnum[]) => SetMetadata(ROLE_KEY,roles);