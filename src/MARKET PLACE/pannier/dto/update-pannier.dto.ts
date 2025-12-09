import { PartialType } from '@nestjs/mapped-types';
import { CreatePannierDto } from './create-pannier.dto';

export class UpdatePannierDto extends PartialType(CreatePannierDto) {}
