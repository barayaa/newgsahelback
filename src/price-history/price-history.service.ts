import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceHistory } from './entities/price-history.entity';

@Injectable()
export class PriceHistoryService {
  constructor(
    @InjectRepository(PriceHistory) private historyRepo: Repository<PriceHistory>,
  ) {}

  async record(produitId: number, prix: number): Promise<void> {
    await this.historyRepo.save({ produit: { id: produitId }, prix });
  }

  async findByProduit(produitId: number, limit = 30) {
    return this.historyRepo.find({
      where: { produit: { id: produitId } },
      order: { enregistreA: 'DESC' },
      take: limit,
    });
  }

  async getAveragePriceByMonth(produitId: number) {
    return this.historyRepo
      .createQueryBuilder('ph')
      .select("TO_CHAR(ph.enregistreA, 'Mon YY')", 'month')
      .addSelect('AVG(ph.prix)', 'avgPrix')
      .where('ph.produitId = :produitId', { produitId })
      .groupBy("TO_CHAR(ph.enregistreA, 'Mon YY')")
      .orderBy("MIN(ph.enregistreA)", 'ASC')
      .limit(12)
      .getRawMany();
  }
}
