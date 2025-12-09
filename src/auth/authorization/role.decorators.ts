import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

// import { Role } from "src/users/enums/role.enum";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
