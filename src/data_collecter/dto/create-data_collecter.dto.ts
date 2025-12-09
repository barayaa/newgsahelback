import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDataCollecterDto {
  @IsNotEmpty({ message: 'userId est requis' })
  @IsNumberString({}, { message: 'userId doit être un nombre valide' })
  // @Transform(({ value }) => parseInt(value, 10))
  userId: number;

  @IsNotEmpty({ message: 'localiteId est requis' })
  @IsNumberString({}, { message: 'localiteId doit être un nombre valide' })
  // @Transform(({ value }) => parseInt(value, 10))
  localiteId: number;

  @IsNotEmpty({ message: 'fileName est requis' })
  @IsString({ message: 'fileName doit être une chaîne' })
  fileName: string;

  @IsOptional()
  @IsString({ message: 'filePath doit être une chaîne' })
  filePath?: string;
}
