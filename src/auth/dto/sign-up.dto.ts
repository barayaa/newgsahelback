import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'Diallo' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Moussa' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: 'moussa@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+22790000000' })
  @IsString()
  @IsNotEmpty()
  telephone: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'Niger' })
  @IsString()
  @IsOptional()
  pays?: string;

  @ApiPropertyOptional({ example: 'Niamey' })
  @IsString()
  @IsOptional()
  ville?: string;
}
