import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMarcherDto } from './dto/create-marcher.dto';
import { UpdateMarcherDto } from './dto/update-marcher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Marcher } from './entities/marcher.entity';
import { Repository } from 'typeorm';
import { Localite } from '../localite/entities/localite.entity';

@Injectable()
export class MarcherService {
  constructor(
    @InjectRepository(Marcher)
    private marcherRepository: Repository<Marcher>,

    @InjectRepository(Localite)
    private localitesRepository: Repository<Localite>,
  ) {}
  async create(createMarcherDto: CreateMarcherDto) {
    const localite = await this.localitesRepository.findOne({
      where: { id: createMarcherDto.localite },
    });

    if (!localite) {
      throw new NotFoundException(
        `Localite avec l'ID ${createMarcherDto.localite} non trouvée`,
      );
    }

    const marcher = this.marcherRepository.create({
      nom: createMarcherDto.nom,
      localite: localite,
      typeMarcher: createMarcherDto.typeMarcher,
      latitude: createMarcherDto.latitude,
      longitude: createMarcherDto.longitude,
      jour_annimation: createMarcherDto.jour_annimation,
    });

    return this.marcherRepository.save(marcher);
  }

  findAll() {
    return this.marcherRepository.find({
      relations: {
        localite: {
          commune: {
            departement: {
              region: true,
            },
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.marcherRepository.findOne({
      where: { id: id },
    });
  }

  async update(id: number, updateMarcherDto: UpdateMarcherDto) {
    const marcher = await this.marcherRepository.findOne({ where: { id } });
    if (!marcher) {
      throw new NotFoundException(`Marcher avec l'ID ${id} non trouvé`);
    }

    if (updateMarcherDto.localite) {
      const localite = await this.localitesRepository.findOne({
        where: { id: updateMarcherDto.localite },
      });
      if (!localite) {
        throw new NotFoundException(
          `Localite avec l'ID ${updateMarcherDto.localite} non trouvée`,
        );
      }
      marcher.localite = localite;
    }

    marcher.nom = updateMarcherDto.nom || marcher.nom;
    return this.marcherRepository.save(marcher);
  }

  async remove(id: number) {
    const marcher = await this.marcherRepository.findOne({ where: { id } });
    if (!marcher) {
      throw new NotFoundException(`Marcher avec l'ID ${id} non trouvé`);
    }
    return this.marcherRepository.remove(marcher);
  }
}
