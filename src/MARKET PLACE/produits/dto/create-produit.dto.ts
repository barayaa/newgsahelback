import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProduitDto {
  @ApiProperty({ example: 'Mil' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nom: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 250 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  prix: number;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantite: number;

  @ApiPropertyOptional()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  unite: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  category: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  user: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  localite?: number;
}
