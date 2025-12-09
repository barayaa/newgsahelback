import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartementDto } from './dto/create-departement.dto';
import { UpdateDepartementDto } from './dto/update-departement.dto';
import { Departement } from './entities/departement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../region/entities/region.entity';

@Injectable()
export class DepartementService {
  constructor(
    @InjectRepository(Departement)
    private departementsRepository: Repository<Departement>,
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) {}
  async create(departementDto: CreateDepartementDto): Promise<Departement> {
    const region = await this.regionsRepository.findOne({
      where: { id: departementDto.region },
    });
    if (!region) {
      throw new NotFoundException(
        `Région avec l'ID ${departementDto.region} non trouvée`,
      );
    }

    const departement = this.departementsRepository.create({
      id: departementDto.id,
      nom: departementDto.nom,
      region,
    });

    return this.departementsRepository.save(departement);
  }

  async findAll(): Promise<Departement[]> {
    return this.departementsRepository.find({ relations: ['region'] });
  }
  async findOne(id: number): Promise<Departement> {
    const departement = await this.departementsRepository.findOne({
      where: { id },
      relations: ['region'],
    });
    if (!departement) {
      throw new NotFoundException(`Département avec l'ID ${id} non trouvé`);
    }
    return departement;
  }

  async findByRegion(regionId: number): Promise<Departement[]> {
    const region = await this.regionsRepository.findOne({
      where: { id: regionId },
    });
    if (!region) {
      throw new NotFoundException(`Région avec l'ID ${regionId} non trouvée`);
    }
    return this.departementsRepository.find({
      where: { region },
      relations: ['region'],
    });
  }

  async update(
    id: number,
    updateDepartementDto: UpdateDepartementDto,
  ): Promise<Departement> {
    const departement = await this.findOne(id);

    if (updateDepartementDto.nom) {
      departement.nom = updateDepartementDto.nom;
    }

    if (updateDepartementDto.region !== undefined) {
      const region = await this.regionsRepository.findOne({
        where: { id: updateDepartementDto.region },
      });
      if (!region) {
        throw new NotFoundException(
          `Région avec l'ID ${updateDepartementDto.region} non trouvée`,
        );
      }
      departement.region = region;
    }

    return this.departementsRepository.save(departement);
  }

  async remove(id: number): Promise<void> {
    const departement = await this.findOne(id);
    await this.departementsRepository.remove(departement);
  }
}
