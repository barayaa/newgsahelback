import { PartialType } from '@nestjs/mapped-types';
import { CreateLocaliteDto } from './create-localite.dto';

export class UpdateLocaliteDto extends PartialType(CreateLocaliteDto) {}
