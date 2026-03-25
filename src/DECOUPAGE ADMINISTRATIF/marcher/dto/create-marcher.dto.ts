import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarcherDto {
  @ApiProperty({ example: 'Marché de Niamey' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'hebdomadaire' })
  @IsString()
  @IsNotEmpty()
  typeMarcher: string;

  @ApiProperty({ example: 13.5137 })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 2.1098 })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 'Lundi' })
  @IsString()
  @IsOptional()
  jour_annimation?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  localite: number;
}
