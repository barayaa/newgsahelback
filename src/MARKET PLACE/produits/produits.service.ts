import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Produit } from './entities/produit.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';
import { Category } from '../categories/entities/category.entity';
import { join } from 'path';
import * as fs from 'fs';
import { MagasinProduit } from 'src/DECOUPAGE ADMINISTRATIF/magasin/entities/magasin_produit.entity';
import { Unites } from '../unite/entities/unite.entity';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Localite)
    private localiteRepository: Repository<Localite>,
    @InjectRepository(MagasinProduit)
    private magasinProduitRepository: Repository<MagasinProduit>,
    @InjectRepository(Unites) private uniteRepository: Repository<Unites>, // Ajout du repository Unite
  ) {}

  // async create(
  //   createProduitDto: CreateProduitDto,
  //   file?: Express.Multer.File,
  // ): Promise<Produit> {
  //   console.log('Données reçues:', createProduitDto);
  //   console.log('Fichier:', file);

  //   if (
  //     !createProduitDto.nom ||
  //     !createProduitDto.description ||
  //     !createProduitDto.prix ||
  //     !createProduitDto.quantite ||
  //     !createProduitDto.category ||
  //     !createProduitDto.user
  //   ) {
  //     throw new BadRequestException(
  //       'Les champs nom, description, prix, quantite, category et user sont obligatoires',
  //     );
  //   }

  //   const user = await this.userRepository.findOne({
  //     where: { id: createProduitDto.user },
  //   });
  //   if (!user) {
  //     throw new BadRequestException('Utilisateur non trouvé');
  //   }

  //   const category = await this.categoryRepository.findOne({
  //     where: { id: createProduitDto.category },
  //   });
  //   if (!category) {
  //     throw new BadRequestException('Catégorie non trouvée');
  //   }
  //   let localite = null;
  //   if (createProduitDto.localite) {
  //     localite = await this.localiteRepository.findOne({
  //       where: { id: createProduitDto.localite },
  //     });
  //     if (!localite) {
  //       throw new BadRequestException('Localité non trouvée');
  //     }
  //   }

  //   if (!file) {
  //     throw new BadRequestException('Une image est requise');
  //   }

  //   const produit = this.produitRepository.create({
  //     nom: createProduitDto.nom,
  //     description: createProduitDto.description,
  //     prix: createProduitDto.prix,
  //     quantite: createProduitDto.quantite,
  //     unite: createProduitDto.unite || null,
  //     image: file.filename, // Sauvegarde du nom du fichier
  //     user,
  //     category,
  //     localite,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   });

  //   const savedProduit = await this.produitRepository.save(produit);

  //   return savedProduit;
  // }

  async create(
    createProduitDto: CreateProduitDto,
    file?: Express.Multer.File,
  ): Promise<Produit> {
    console.log('Données reçues:', createProduitDto);
    console.log('Fichier:', file);

    // Vérification des champs obligatoires
    if (
      !createProduitDto.nom ||
      !createProduitDto.description ||
      !createProduitDto.prix ||
      !createProduitDto.quantite ||
      !createProduitDto.category ||
      !createProduitDto.user ||
      !createProduitDto.unite // Ajout de la vérification pour unite
    ) {
      throw new BadRequestException(
        'Les champs nom, description, prix, quantite, category, user et unite sont obligatoires',
      );
    }

    // Vérification de l'utilisateur
    const user = await this.userRepository.findOne({
      where: { id: createProduitDto.user },
    });
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    // Vérification de la catégorie
    const category = await this.categoryRepository.findOne({
      where: { id: createProduitDto.category },
    });
    if (!category) {
      throw new BadRequestException('Catégorie non trouvée');
    }

    // Vérification de la localité (optionnelle)
    let localite = null;
    if (createProduitDto.localite) {
      localite = await this.localiteRepository.findOne({
        where: { id: createProduitDto.localite },
      });
      if (!localite) {
        throw new BadRequestException('Localité non trouvée');
      }
    }

    // Vérification de l'unité de mesure
    const unite = await this.uniteRepository.findOne({
      where: { id: createProduitDto.unite },
    });
    if (!unite) {
      throw new BadRequestException('Unité de mesure non trouvée');
    }

    // Vérification du fichier
    if (!file) {
      throw new BadRequestException('Une image est requise');
    }

    // Création du produit avec les relations
    const produit = this.produitRepository.create({
      nom: createProduitDto.nom,
      description: createProduitDto.description,
      prix: createProduitDto.prix,
      quantite: createProduitDto.quantite,
      image: file.filename, // Sauvegarde du nom du fichier
      user,
      category,
      localite,
      unite, // Relation avec l'entité Unite
    });

    const savedProduit = await this.produitRepository.save(produit);

    return savedProduit;
  }
  async findAll(): Promise<Produit[]> {
    return this.produitRepository.find({
      relations: ['user', 'category', 'localite'],
    });
  }

  async findOne(id: number): Promise<Produit> {
    const produit = await this.produitRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'localite'],
    });
    if (!produit) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }
    return produit;
  }

  findByUser(userId: number) {
    return this.produitRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        user: true,
        category: true,
      },
    });
  }

  async deleteByUser(userId: number): Promise<void> {
    const produits = await this.produitRepository.find({
      where: { user: { id: userId } },
    });

    if (produits.length === 0) {
      throw new NotFoundException(
        `Aucun produit trouvé pour l'utilisateur ${userId}`,
      );
    }

    for (const produit of produits) {
      // Supprimer l'image du système de fichiers si elle existe
      if (produit.image) {
        const imagePath = join(__dirname, '..', '..', produit.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    await this.produitRepository.delete({ user: { id: userId } });
  }

  async update(
    id: number,
    updateProduitDto: UpdateProduitDto,
    user: any,
    file?: Express.Multer.File,
  ): Promise<Produit> {
    if (user.role !== Role.VENDEUR) {
      throw new ForbiddenException(
        'Seuls les vendeurs peuvent modifier des produits',
      );
    }

    const produit = await this.findOne(id);

    if (produit.user.id !== user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres produits',
      );
    }

    if (updateProduitDto.category) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProduitDto.category },
      });
      if (!category) {
        throw new NotFoundException(
          `Catégorie avec l'ID ${updateProduitDto.category} non trouvée`,
        );
      }
      produit.category = category;
    }

    if (updateProduitDto.localite) {
      const localite = await this.localiteRepository.findOne({
        where: { id: updateProduitDto.localite },
      });
      if (!localite) {
        throw new NotFoundException(
          `Localité avec l'ID ${updateProduitDto.localite} non trouvée`,
        );
      }
      produit.localite = localite;
    }

    if (updateProduitDto.nom) produit.nom = updateProduitDto.nom;
    if (updateProduitDto.description)
      produit.description = updateProduitDto.description;
    if (updateProduitDto.prix) produit.prix = updateProduitDto.prix;
    if (updateProduitDto.quantite) produit.quantite = updateProduitDto.quantite;

    if (file) {
      // Supprimer l'ancienne image si elle existe
      if (produit.image) {
        const oldImagePath = join(__dirname, '..', '..', produit.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      produit.image = `/uploads/${file.filename}`;
    }

    return this.produitRepository.save(produit);
  }
  async remove(id: number): Promise<void> {
    // const produit = await this.findOne(id);

    // // if (produit.user.id !== user.id) {
    // //   throw new ForbiddenException(
    // //     'Vous ne pouvez supprimer que vos propres produits',
    // //   );
    // // }

    // await this.produitRepository.remove(produit);

    const produit = await this.produitRepository.findOne({ where: { id } });
    if (!produit) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    // Mets à NULL les références dans magasin_produit
    await this.magasinProduitRepository.update(
      { produit: { id } },
      { produit: null },
    );

    await this.produitRepository.delete(id);
  }
}
