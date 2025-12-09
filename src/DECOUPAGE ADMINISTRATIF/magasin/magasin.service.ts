import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMagasinDto } from './dto/create-magasin.dto';
import { UpdateMagasinDto } from './dto/update-magasin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Magasin } from './entities/magasin.entity';
import { Repository } from 'typeorm/repository/Repository';
import { Localite } from '../localite/entities/localite.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { MagasinProduit } from './entities/magasin_produit.entity';

@Injectable()
export class MagasinService {
  constructor(
    @InjectRepository(Magasin)
    private magasinRepository: Repository<Magasin>,

    @InjectRepository(Localite)
    private localiteRepository: Repository<Localite>,

    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,

    @InjectRepository(MagasinProduit)
    private magasinProduitRepository: Repository<MagasinProduit>,
  ) {}

  // async create(createMagasinDto: CreateMagasinDto) {
  //   const localite = await this.localiteRepository.findOne({
  //     where: { id: createMagasinDto.localite },
  //   });
  //   if (!localite) {
  //     throw new NotFoundException(
  //       `Localite avec l'ID ${createMagasinDto.localite} non trouvée`,
  //     );
  //   }
  //   const magasin = this.magasinRepository.create({
  //     nom: createMagasinDto.nom,
  //     description: createMagasinDto.description,
  //     localite: localite,
  //   });
  //   const savedMagasin = await this.magasinRepository.save(magasin);
  //   if (
  //     createMagasinDto.magasinProduits &&
  //     createMagasinDto.magasinProduits.length > 0
  //   ) {
  //     const magasinProduitsPromises = createMagasinDto.magasinProduits.map(
  //       async (mp) => {
  //         const produit = await this.produitRepository.findOne({
  //           where: { id: mp.produitId },
  //         });
  //         if (!produit) {
  //           throw new NotFoundException(
  //             `Produit avec l'ID ${mp.produitId} non trouvé`,
  //           );
  //         }
  //         return this.magasinProduitRepository.create({
  //           magasin: savedMagasin,
  //           produit: produit,
  //           quantite: mp.quantite,
  //         });
  //       },
  //     );
  //     const magasinProduits = await Promise.all(magasinProduitsPromises);
  //     await this.magasinProduitRepository.save(magasinProduits);
  //   }
  //   return this.magasinRepository.findOne({
  //     where: { id: savedMagasin.id },
  //     relations: { localite: true, magasinProduits: { produit: true } },
  //   });
  // }

  async create(createMagasinDto: CreateMagasinDto) {
    // Chercher la Localite
    const localite = await this.localiteRepository.findOne({
      where: { id: createMagasinDto.localite },
    });
    if (!localite) {
      throw new NotFoundException(
        `Localite avec l'ID ${createMagasinDto.localite} non trouvée`,
      );
    }

    // Créer le Magasin
    const magasin = this.magasinRepository.create({
      nom: createMagasinDto.nom,
      description: createMagasinDto.description,
      localite: localite,
    });

    const savedMagasin = await this.magasinRepository.save(magasin);

    // Associer les produits
    if (
      createMagasinDto.magasinProduits &&
      createMagasinDto.magasinProduits.length > 0
    ) {
      const magasinProduits = await Promise.all(
        createMagasinDto.magasinProduits.map(async (produitId) => {
          const produit = await this.produitRepository.findOne({
            where: { id: produitId },
          });
          if (!produit) {
            throw new NotFoundException(
              `Produit avec l'ID ${produitId} non trouvé`,
            );
          }
          return this.magasinProduitRepository.create({
            magasin: savedMagasin,
            produit: produit,
          });
        }),
      );
      await this.magasinProduitRepository.save(magasinProduits);
    }

    // Recharger le magasin avec les relations
    return this.magasinRepository.findOne({
      where: { id: savedMagasin.id },
      relations: { localite: true, magasinProduits: { produit: true } },
    });
  }

  findAll() {
    return this.magasinRepository.find({
      relations: { localite: true, magasinProduits: { produit: true } },
    });
  }

  findOne(id: number) {
    return this.magasinRepository.findOne({
      where: { id },
      relations: { localite: true, magasinProduits: { produit: true } },
    });
  }

  async update(id: number, updateMagasinDto: UpdateMagasinDto) {
    const magasin = await this.magasinRepository.findOne({ where: { id } });
    if (!magasin) {
      throw new NotFoundException(`Magasin avec l'ID ${id} non trouvé`);
    }

    if (updateMagasinDto.localite) {
      const localite = await this.localiteRepository.findOne({
        where: { id: updateMagasinDto.localite },
      });
      if (!localite) {
        throw new NotFoundException(
          `Localite avec l'ID ${updateMagasinDto.localite} non trouvée`,
        );
      }
      magasin.localite = localite;
    }

    magasin.nom = updateMagasinDto.nom || magasin.nom;
    magasin.description = updateMagasinDto.description || magasin.description;

    if (updateMagasinDto.magasinProduits) {
      await this.magasinProduitRepository.delete({ magasin: { id } });
      const magasinProduits = await Promise.all(
        updateMagasinDto.magasinProduits.map(async (produitId) => {
          const produit = await this.produitRepository.findOne({
            where: { id: produitId },
          });
          if (!produit) {
            throw new NotFoundException(
              `Produit avec l'ID ${produitId} non trouvé`,
            );
          }
          return this.magasinProduitRepository.create({
            magasin: magasin,
            produit: produit,
          });
        }),
      );
      await this.magasinProduitRepository.save(magasinProduits);
    }

    await this.magasinRepository.save(magasin);
    return this.magasinRepository.findOne({
      where: { id },
      relations: { localite: true, magasinProduits: { produit: true } },
    });
  }

  async remove(id: number) {
    const magasin = await this.magasinRepository.findOne({ where: { id } });
    if (!magasin) {
      throw new NotFoundException(`Magasin avec l'ID ${id} non trouvé`);
    }

    await this.magasinProduitRepository.delete({ magasin: { id } });
    return this.magasinRepository.remove(magasin);
  }
}
