import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

export class SignupDto {
  nom: string;
  prenom: string;
  @IsEmail()
  email: string;
  telephone: string;
  role: Role;
  password: string;
}
