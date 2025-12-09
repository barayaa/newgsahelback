import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommuneDto } from './dto/create-commune.dto';
import { UpdateCommuneDto } from './dto/update-commune.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Commune } from './entities/commune.entity';
import { Repository } from 'typeorm';
import { Departement } from '../departement/entities/departement.entity';

@Injectable()
export class CommuneService {
  constructor(
    @InjectRepository(Commune)
    private communeRepository: Repository<Commune>,

    @InjectRepository(Departement)
    private departementsRepository: Repository<Departement>,
  ) {}
  async create(createCommuneDto: CreateCommuneDto) {
    const departement = await this.departementsRepository.findOne({
      where: { id: createCommuneDto.departement },
    });

    if (!departement) {
      throw new NotFoundException(
        `Departemetn avec l'ID ${createCommuneDto.departement} non trouvée`,
      );
    }

    const commune = this.communeRepository.create({
      nom: createCommuneDto.nom,
      departement,
    });

    return this.communeRepository.save(commune);
  }

  findAll() {
    return this.communeRepository.find({ relations: ['departement'] });
  }

  findOne(id: number) {
    const commune = this.communeRepository.findOne({
      where: { id },
      relations: ['departement'],
    });
    if (!commune) {
      throw new NotFoundException(`Commune avec l'ID ${id} non trouvée`);
    }
    return commune;
  }

  findByDepartement(departementId: number) {
    const departement = this.departementsRepository.findOne({
      where: { id: departementId },
    });
    if (!departement) {
      throw new NotFoundException(
        `Département avec l'ID ${departementId} non trouvé`,
      );
    }
    return this.communeRepository.find({
      where: { id: departementId },
      relations: ['departement'],
    });
  }

  async update(
    id: number,
    updateCommuneDto: UpdateCommuneDto,
  ): Promise<Commune> {
    const commune = await this.findOne(id);

    if (updateCommuneDto.nom) {
      commune.nom = updateCommuneDto.nom;
    }

    if (updateCommuneDto.departement) {
      const departement = await this.departementsRepository.findOne({
        where: { id: updateCommuneDto.departement },
      });
      if (!departement) {
        throw new NotFoundException(
          `Département avec l'ID ${updateCommuneDto.departement} non trouvé`,
        );
      }
      commune.departement = departement;
    }

    return this.communeRepository.save(commune);
  }

  async remove(id: number) {
    const commune = await this.findOne(id);
    if (!commune) {
      throw new NotFoundException(`Commune avec l'ID ${id} non trouvée`);
    }
    return this.communeRepository.remove(commune);
  }
}
