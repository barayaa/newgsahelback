import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocaliteDto } from './dto/create-localite.dto';
import { UpdateLocaliteDto } from './dto/update-localite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Localite } from './entities/localite.entity';
import { Commune } from '../commune/entities/commune.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocaliteService {
  constructor(
    @InjectRepository(Localite)
    private localitesRepository: Repository<Localite>,
    @InjectRepository(Commune)
    private communesRepository: Repository<Commune>,
  ) {}

  async create(createLocaliteDto: CreateLocaliteDto): Promise<Localite> {
    const commune = await this.communesRepository.findOne({
      where: { id: createLocaliteDto.commune },
    });
    if (!commune) {
      throw new NotFoundException(
        `Commune avec l'ID ${createLocaliteDto.commune} non trouvée`,
      );
    }

    const localite = this.localitesRepository.create({
      nom: createLocaliteDto.nom,
      commune,
    });

    return this.localitesRepository.save(localite);
  }

  async findAll(): Promise<Localite[]> {
    return this.localitesRepository.find({
      relations: {
        commune: {
          departement: {
            region: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<Localite> {
    const localite = await this.localitesRepository.findOne({
      where: { id },
      relations: {
        commune: {
          departement: {
            region: true,
          },
        },
        produits: true,
      },
    });
    if (!localite) {
      throw new NotFoundException(`Localité avec l'ID ${id} non trouvée`);
    }
    return localite;
  }
  async update(
    id: number,
    updateLocaliteDto: UpdateLocaliteDto,
  ): Promise<Localite> {
    const localite = await this.findOne(id);

    if (updateLocaliteDto.nom) {
      localite.nom = updateLocaliteDto.nom;
    }

    if (updateLocaliteDto.commune) {
      const commune = await this.communesRepository.findOne({
        where: { id: updateLocaliteDto.commune },
      });
      if (!commune) {
        throw new NotFoundException(
          `Commune avec l'ID ${updateLocaliteDto.commune} non trouvée`,
        );
      }
      localite.commune = commune;
    }

    return this.localitesRepository.save(localite);
  }

  async remove(id: number): Promise<void> {
    const localite = await this.findOne(id);
    await this.localitesRepository.remove(localite);
  }
}
