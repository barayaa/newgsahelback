import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  SetMetadata,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
@Controller('produits')
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  @Delete('user/produit/:id')
  deleteUserProduct(@Param('id') id: number) {
    return this.produitsService.remove(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `image-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          cb(
            new Error(
              'Seuls les fichiers JPG, JPEG, PNG, GIF et WEBP sont autorisés',
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async create(
    @Body() createProduitDto: CreateProduitDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.produitsService.create(createProduitDto, file);
  }

  @Get('user/produit/:userId')
  getUserProduct(@Param('userId') userId: number) {
    return this.produitsService.findByUser(userId);
  }

  @Auth(AuthType.None)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: number,
    @Query('localite') localite?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.produitsService.findAll({ search, category, localite, page, limit });
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.produitsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProduitDto: UpdateProduitDto,
    @Request() req,
  ) {
    return this.produitsService.update(+id, updateProduitDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produitsService.remove(+id);
  }
}
