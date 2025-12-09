import { Test, TestingModule } from '@nestjs/testing';
import { DataCollecterController } from './data_collecter.controller';
import { DataCollecterService } from './data_collecter.service';

describe('DataCollecterController', () => {
  let controller: DataCollecterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataCollecterController],
      providers: [DataCollecterService],
    }).compile();

    controller = module.get<DataCollecterController>(DataCollecterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
