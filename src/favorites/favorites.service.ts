import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private favRepo: Repository<Favorite>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Produit) private produitRepo: Repository<Produit>,
  ) {}

  async toggle(userId: number, produitId: number): Promise<{ added: boolean; message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const produit = await this.produitRepo.findOne({ where: { id: produitId } });
    if (!produit) throw new NotFoundException('Produit non trouvé');

    const existing = await this.favRepo.findOne({
      where: { user: { id: userId }, produit: { id: produitId } },
    });

    if (existing) {
      await this.favRepo.remove(existing);
      return { added: false, message: 'Retiré des favoris' };
    }

    const fav = this.favRepo.create({ user, produit });
    await this.favRepo.save(fav);
    return { added: true, message: 'Ajouté aux favoris' };
  }

  async findByUser(userId: number) {
    return this.favRepo.find({
      where: { user: { id: userId } },
      relations: { produit: { category: true, user: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async isFavorite(userId: number, produitId: number): Promise<boolean> {
    const fav = await this.favRepo.findOne({
      where: { user: { id: userId }, produit: { id: produitId } },
    });
    return !!fav;
  }

  async getUserFavoriteIds(userId: number): Promise<number[]> {
    const favs = await this.favRepo.find({
      where: { user: { id: userId } },
      relations: ['produit'],
    });
    return favs.map(f => f.produit.id);
  }
}
