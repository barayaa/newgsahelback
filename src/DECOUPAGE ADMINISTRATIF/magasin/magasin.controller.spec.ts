import { Test, TestingModule } from '@nestjs/testing';
import { MagasinController } from './magasin.controller';
import { MagasinService } from './magasin.service';

describe('MagasinController', () => {
  let controller: MagasinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MagasinController],
      providers: [MagasinService],
    }).compile();

    controller = module.get<MagasinController>(MagasinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
