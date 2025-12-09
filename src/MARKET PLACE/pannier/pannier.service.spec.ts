import { Test, TestingModule } from '@nestjs/testing';
import { PannierService } from './pannier.service';

describe('PannierService', () => {
  let service: PannierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PannierService],
    }).compile();

    service = module.get<PannierService>(PannierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
