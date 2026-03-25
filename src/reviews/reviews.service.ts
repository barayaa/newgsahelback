import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Produit) private produitRepo: Repository<Produit>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const auteur = await this.userRepo.findOne({ where: { id: dto.auteurId } });
    if (!auteur) throw new NotFoundException('Utilisateur non trouvé');

    const produit = await this.produitRepo.findOne({ where: { id: dto.produitId } });
    if (!produit) throw new NotFoundException('Produit non trouvé');

    // One review per user per product
    const existing = await this.reviewRepo.findOne({
      where: { auteur: { id: dto.auteurId }, produit: { id: dto.produitId } },
    });
    if (existing) throw new BadRequestException('Vous avez déjà évalué ce produit');

    const review = this.reviewRepo.create({
      note: dto.note,
      commentaire: dto.commentaire,
      auteur,
      produit,
    });
    return this.reviewRepo.save(review);
  }

  async findByProduit(produitId: number) {
    const reviews = await this.reviewRepo.find({
      where: { produit: { id: produitId } },
      relations: ['auteur'],
      order: { createdAt: 'DESC' },
    });

    const total = reviews.length;
    const moyenne = total > 0 ? reviews.reduce((sum, r) => sum + r.note, 0) / total : 0;

    return {
      reviews: reviews.map(r => ({
        id: r.id,
        note: r.note,
        commentaire: r.commentaire,
        auteur: `${r.auteur.nom} ${r.auteur.prenom}`,
        createdAt: r.createdAt,
      })),
      stats: {
        total,
        moyenne: Math.round(moyenne * 10) / 10,
        distribution: [1, 2, 3, 4, 5].map(n => ({
          note: n,
          count: reviews.filter(r => r.note === n).length,
        })),
      },
    };
  }

  async findBySeller(sellerId: number) {
    const reviews = await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.produit', 'produit')
      .leftJoinAndSelect('produit.user', 'vendeur')
      .leftJoinAndSelect('review.auteur', 'auteur')
      .where('vendeur.id = :sellerId', { sellerId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    const total = reviews.length;
    const moyenne = total > 0 ? reviews.reduce((sum, r) => sum + r.note, 0) / total : 0;
    return { reviews, moyenne: Math.round(moyenne * 10) / 10, total };
  }

  async remove(id: number): Promise<void> {
    await this.reviewRepo.delete(id);
  }
}
