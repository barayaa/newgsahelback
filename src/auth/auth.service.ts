import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
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
import { OtmailService } from './otpmail/otmail.service';

@Injectable()
export class AuthService {
  private verificationCodes: {
    [key: string]: { code: string; expiresAt: Date };
  } = {};

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private hasshingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConffigutation: ConfigType<typeof jwtConfig>,
    private otpmailSvce: OtmailService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(email: string, code: string) {
    await this.otpmailSvce.sendEmail({
      to: email,
      subject: 'Votre code de vérification ',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">
          Grenier du sahel - Code de vérification
        </h2>
        <p>Bonjour,</p>
        <p>Merci de vérifier votre adresse e-mail. Voici votre 'code' de vérification :</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #4CAF50;">${code}</span>
        </div>
        <p>Veuillez entrer ce 'code' dans l'application pour terminer le processus de vérification.</p>
        <p style="font-size: 12px; color: #777;">Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; text-align: center; color: #777;">
          &copy; ${new Date().getFullYear()} OOPSFARM. Tous droits réservés.
        </p>
      </div>
    `,
    });
  }

  async signUp(signUpDto: SignupDto) {
    try {
      // const verificationCode = this.generateVerificationCode();
      // await this.sendVerificationCode(signUpDto.email, verificationCode);

      // const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

      // this.verificationCodes[signUpDto.email] = {
      //   code: verificationCode,
      //   expiresAt,
      // };

      // return { message: 'Code de vérification envoyé à votre adresse e-mail' };

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

  async verifyCode(email: string, code: string, signUpDto: SignupDto) {
    const storedCode = this.verificationCodes[email];

    if (new Date() > storedCode.expiresAt) {
      throw new UnauthorizedException('Le code de vérification a expiré');
    }
    if (storedCode.code !== code) {
      throw new UnauthorizedException('Code de vérification incorrect');
    }
    delete this.verificationCodes[email];

    const user = new User();
    user.nom = signUpDto.nom;
    user.prenom = signUpDto.prenom;
    user.email = signUpDto.email;
    user.telephone = signUpDto.telephone;
    user.password = await this.hasshingService.hash(signUpDto.password);
    await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async regenerateVerificationCode(email: string) {
    const verificationCode = this.generateVerificationCode();
    await this.sendVerificationCode(email, verificationCode);
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
    this.verificationCodes[email] = { code: verificationCode, expiresAt };
    return {
      message: 'Nouveau code de vérification envoyé à votre adresse e-mail',
    };
  }

  async verfiUserByEmailAndSendEmail(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new UnauthorizedException("L'utilisateur n'existe pas");
    }

    const verificationCode = this.generateVerificationCode();
    await this.sendVerificationCode(email, verificationCode);

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
    this.verificationCodes[email] = { code: verificationCode, expiresAt };
    return {
      user,
      message: 'Code de vérification envoyé à votre adresse e-mail',
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
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
      where: {
        id: changePasswordDto.userId,
      },
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
