import { Test, TestingModule } from '@nestjs/testing';
import { MarcherService } from './marcher.service';

describe('MarcherService', () => {
  let service: MarcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarcherService],
    }).compile();

    service = module.get<MarcherService>(MarcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
