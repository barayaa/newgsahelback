import { PartialType } from '@nestjs/mapped-types';
import { CreateDataCollecterDto } from './create-data_collecter.dto';

export class UpdateDataCollecterDto extends PartialType(CreateDataCollecterDto) {}
