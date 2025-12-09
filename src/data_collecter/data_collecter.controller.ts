import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { DataCollecterService } from './data_collecter.service';
import { CreateDataCollecterDto } from './dto/create-data_collecter.dto';
import { UpdateDataCollecterDto } from './dto/update-data_collecter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('data-collecter')
export class DataCollecterController {
  constructor(private readonly dataCollecterService: DataCollecterService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/data', // Assurez-vous que ce dossier existe
        filename: (req, file, cb) => {
          // Nettoyer le nom de fichier pour éviter les caractères problématiques
          const cleanFilename = file.originalname.replace(
            /[^a-zA-Z0-9.-]/g,
            '_',
          );
          cb(null, `${Date.now()}-${cleanFilename}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Vérification supplémentaire du type de fichier
        const allowedMimes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error('Seuls les fichiers Excel (.xlsx, .xls) sont autorisés'),
            false,
          );
        }
      },
    }),
  )
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }), // 10 Mo
          new FileTypeValidator({
            fileType: /\.(xlsx|xls)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      // Validation des données du body
      if (!body.userId || !body.localiteId) {
        throw new BadRequestException('userId et localiteId sont requis');
      }

      const createDataCollecterDto: CreateDataCollecterDto = {
        userId: parseInt(body.userId, 10),
        localiteId: parseInt(body.localiteId, 10),
        fileName: file.originalname,
        filePath: file.path,
      };

      // Validation des IDs
      if (
        isNaN(createDataCollecterDto.userId) ||
        isNaN(createDataCollecterDto.localiteId)
      ) {
        throw new BadRequestException(
          'userId et localiteId doivent être des nombres valides',
        );
      }

      return await this.dataCollecterService.create(createDataCollecterDto);
    } catch (error) {
      // Supprimer le fichier uploadé en cas d'erreur
      if (file && file.path) {
        const fs = require('fs');
        fs.unlink(file.path, (err) => {
          if (err)
            console.error('Erreur lors de la suppression du fichier:', err);
        });
      }
      throw error;
    }
  }

  @Get()
  async findAll() {
    return this.dataCollecterService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.dataCollecterService.findOne(id);
  }
}
