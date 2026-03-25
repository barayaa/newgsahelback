import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class InitierPaiementDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  telephone: string;
}
