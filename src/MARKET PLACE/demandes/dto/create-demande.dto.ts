import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutDemande } from '../entities/demande.entity';

export class CreateDemandeDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  produit: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantite: number;

  @ApiProperty({ example: 2500 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  montantTotal: number;

  @ApiPropertyOptional({ enum: StatutDemande })
  @IsEnum(StatutDemande)
  @IsOptional()
  statut?: StatutDemande;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  acheteur: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  dateLivraisonSouhaitee?: Date;
}
