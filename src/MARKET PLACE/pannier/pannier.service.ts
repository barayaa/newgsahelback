import { Injectable } from '@nestjs/common';
import { CreatePannierDto } from './dto/create-pannier.dto';
import { UpdatePannierDto } from './dto/update-pannier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pannier } from './entities/pannier.entity';
import { Repository } from 'typeorm';
import { Produit } from '../produits/entities/produit.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';

@Injectable()
export class PannierService {
  constructor(
    @InjectRepository(Pannier) private panierRepository: Repository<Pannier>,
    @InjectRepository(Produit) private produitRepository: Repository<Produit>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async addToCart(createPannierDto: CreatePannierDto): Promise<Pannier> {
    // Extraire userId et produitId du DTO
    const { userId, produitId } = createPannierDto;

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    let panier = await this.panierRepository.findOne({
      where: { user: { id: userId } },
      relations: ['produits'],
    });

    if (!panier) {
      panier = this.panierRepository.create({ user, produits: [] });
    }

    const produit = await this.produitRepository.findOne({
      where: { id: produitId },
    });
    if (!produit) {
      throw new Error('Produit non trouvé');
    }

    panier.produits.push(produit);
    return this.panierRepository.save(panier);
  }

  async getCart(userId: number): Promise<Pannier | null> {
    const pannier = await this.panierRepository.findOne({
      where: { user: { id: userId } },
      relations: ['produits', 'user'],
    });
    return pannier;
  }

  async clearCart(userId: number): Promise<void> {
    const panier = await this.panierRepository.findOne({
      where: { user: { id: userId } },
    });
    if (panier) {
      panier.produits = [];
      await this.panierRepository.save(panier);
    }
  }

  async removeFromCart(userId: number, produitId: number): Promise<Pannier> {
    const panier = await this.panierRepository.findOne({
      where: { user: { id: userId } },
      relations: ['produits'],
    });

    if (!panier) {
      throw new Error('Panier non trouvé');
    }

    console.log('Produits avant suppression:', panier.produits);

    panier.produits.forEach((produit) => {
      // console.log(
      //   `Produit ID: ${produit.id}, Type de produit.id: ${typeof produit.id}, produitId: ${produitId}, Type de produitId: ${typeof produitId}`,
      // );
    });

    const numericProduitId = Number(produitId);

    const produitIndex = panier.produits.findIndex((produit) => {
      const prodId = Number(produit.id);

      return prodId === numericProduitId;
    });

    if (produitIndex === -1) {
      throw new Error('Produit non trouvé dans le panier');
    }

    panier.produits.splice(produitIndex, 1);

    const savedPanier = await this.panierRepository.save(panier, {
      transaction: true,
    });

    const verifiedPanier = await this.panierRepository.findOne({
      where: { user: { id: userId } },
      relations: ['produits'],
    });

    return verifiedPanier;
  }
}
