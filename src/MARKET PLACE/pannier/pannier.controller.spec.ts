import { Test, TestingModule } from '@nestjs/testing';
import { PannierController } from './pannier.controller';
import { PannierService } from './pannier.service';

describe('PannierController', () => {
  let controller: PannierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PannierController],
      providers: [PannierService],
    }).compile();

    controller = module.get<PannierController>(PannierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
