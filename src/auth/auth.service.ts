import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { SignupDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private hasshingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConffigutation: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignupDto) {
    try {
      const user = this.userRepository.create(signUpDto);
      user.password = await this.hasshingService.hash(user.password);
      await this.userRepository.save(user);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code === pgUniqueViolationErrorCode) {
        throw new ConflictException();
      }
      throw err;
    }
  }

  async verifyCode(_email: string, _code: string, _signUpDto: SignupDto) {
    return { message: 'Vérification non requise' };
  }

  async regenerateVerificationCode(_email: string) {
    return { message: 'Service email désactivé' };
  }

  async verfiUserByEmailAndSendEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException("L'utilisateur n'existe pas");
    }
    return { user, message: 'Utilisateur trouvé' };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
      select: ['id', 'email', 'nom', 'prenom', 'role', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException("l'utilisateur n'existe pas");
    }

    const isEqual = await this.hasshingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('mot de passe incorrect');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
      {
        audience: this.jwtConffigutation.audience,
        issuer: this.jwtConffigutation.issuer,
        secret: this.jwtConffigutation.secret,
        expiresIn: this.jwtConffigutation.accessTokenTtl,
      },
    );

    return { accessToken };
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: changePasswordDto.userId },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException("L'utilisateur n'existe pas");
    }

    const isCurrentPasswordValid = await this.hasshingService.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    user.password = await this.hasshingService.hash(
      changePasswordDto.newPassword,
    );
    await this.userRepository.save(user);
    return { message: 'Mot de passe modifié avec succès' };
  }
}
