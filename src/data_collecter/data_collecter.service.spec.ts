import { Test, TestingModule } from '@nestjs/testing';
import { DataCollecterService } from './data_collecter.service';

describe('DataCollecterService', () => {
  let service: DataCollecterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataCollecterService],
    }).compile();

    service = module.get<DataCollecterService>(DataCollecterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
