import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  note: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  commentaire?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  produitId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  auteurId: number;
}
