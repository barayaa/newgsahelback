import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Unites } from './entities/unite.entity';

@Injectable()
export class UniteService {
  constructor(
    @InjectRepository(Unites)
    private uniteRepository: Repository<Unites>,
  ) {}
  async create(createUniteDto: CreateUniteDto): Promise<Unites> {
    const existingUnite = await this.uniteRepository.findOne({
      where: { nom: createUniteDto.nom },
    });
    if (existingUnite) {
      throw new BadRequestException('Une unité avec ce nom existe déjà');
    }

    const unite = this.uniteRepository.create(createUniteDto);
    return this.uniteRepository.save(unite);
  }

  findAll() {
    const unites = this.uniteRepository.find();
    return unites;
  }

  async findOne(id: number) {
    const unite = await this.uniteRepository.findOne({ where: { id } });
    if (!unite) {
      throw new NotFoundException(`Unité avec l'ID ${id} non trouvée`);
    }
    return unite;
  }

  async update(id: number, updateUniteDto: UpdateUniteDto) {
    const unite = await this.uniteRepository.findOne({ where: { id } });
    if (!unite) {
      throw new NotFoundException(`Unité avec l'ID ${id} non trouvée`);
    }

    if (updateUniteDto.nom && updateUniteDto.nom !== unite.nom) {
      const existingUnite = await this.uniteRepository.findOne({
        where: { nom: updateUniteDto.nom },
      });
      if (existingUnite) {
        throw new BadRequestException('Une unité avec ce nom existe déjà');
      }
    }

    Object.assign(unite, updateUniteDto);
    return this.uniteRepository.save(unite);
  }

  async remove(id: number): Promise<void> {
    const unite = await this.uniteRepository.findOne({ where: { id } });
    if (!unite) {
      throw new NotFoundException(`Unité avec l'ID ${id} non trouvée`);
    }

    const hasProducts = await this.uniteRepository
      .createQueryBuilder('unite')
      .leftJoinAndSelect('unite.produits', 'produits')
      .where('unite.id = :id', { id })
      .getOne();
    if (hasProducts && hasProducts.produits.length > 0) {
      throw new BadRequestException(
        'Cette unité est utilisée par des produits et ne peut pas être supprimée',
      );
    }

    await this.uniteRepository.delete(id);
  }
}
