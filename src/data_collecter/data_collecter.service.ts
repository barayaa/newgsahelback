import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDataCollecterDto } from './dto/create-data_collecter.dto';
import { UpdateDataCollecterDto } from './dto/update-data_collecter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataCollecter } from './entities/data_collecter.entity';
import { Repository } from 'typeorm';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';
import * as fs from 'fs';

@Injectable()
export class DataCollecterService {
  constructor(
    @InjectRepository(DataCollecter)
    private dataCollecterRepository: Repository<DataCollecter>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Localite)
    private localiteRepository: Repository<Localite>,
  ) {}

  async create(
    createDataCollecterDto: CreateDataCollecterDto,
  ): Promise<DataCollecter> {
    const { userId, localiteId, fileName, filePath } = createDataCollecterDto;

    try {
      console.log('Service create called with:', createDataCollecterDto);

      // Vérification de l'utilisateur
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: [], // Ajuster selon vos besoins
      });

      if (!user) {
        throw new NotFoundException(
          `Utilisateur avec l'ID ${userId} non trouvé`,
        );
      }

      if (user.role !== Role.COLLECTEUR && user.role !== Role.ADMIN) {
        throw new ForbiddenException(
          `Utilisateur non autorisé (rôle Collecteur ou Admin requis, rôle actuel: ${user.role})`,
        );
      }

      // Vérification de la localité
      const localite = await this.localiteRepository.findOne({
        where: { id: localiteId },
      });

      if (!localite) {
        throw new NotFoundException(
          `Localité avec l'ID ${localiteId} non trouvée`,
        );
      }

      // Vérifier que le fichier existe réellement
      if (!fs.existsSync(filePath)) {
        throw new Error(`Le fichier ${filePath} n'existe pas sur le serveur`);
      }

      console.log('Creating data collecter entity...');

      // Créer l'entité
      const dataCollecter = this.dataCollecterRepository.create({
        user,
        localite,
        fileName,
        filePath,
        createdAt: new Date(), // Si vous avez ce champ
      });

      console.log('Saving data collecter entity...');
      const savedEntity =
        await this.dataCollecterRepository.save(dataCollecter);

      console.log('Data collecter saved successfully:', savedEntity.id);
      return savedEntity;
    } catch (error) {
      console.error('Erreur dans create DataCollecter:', error);

      // Supprimer le fichier en cas d'erreur
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err)
            console.error('Erreur lors de la suppression du fichier:', err);
        });
      }

      throw error;
    }
  }

  async findAll(): Promise<DataCollecter[]> {
    return this.dataCollecterRepository.find({
      relations: ['user', 'localite'],
    });
  }

  async findOne(id: number): Promise<DataCollecter> {
    const dataCollecter = await this.dataCollecterRepository.findOne({
      where: { id },
      relations: ['user', 'localite'],
    });
    if (!dataCollecter) {
      throw new Error('DataCollecter non trouvé');
    }
    return dataCollecter;
  }
}
