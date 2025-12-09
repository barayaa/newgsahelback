import { PartialType } from '@nestjs/mapped-types';
import { CreateMarcherDto } from './create-marcher.dto';

export class UpdateMarcherDto extends PartialType(CreateMarcherDto) {}
