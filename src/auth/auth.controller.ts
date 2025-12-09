import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { Auth } from './decorators/auth.decorators';
import { AuthType } from './enums/auth.types.enum';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Roles(Role.Admin)
  @Auth(AuthType.None)
  @Post('sign-up')
  signup(@Body() signUpDto: SignupDto) {
    return this.authService.signUp(signUpDto);
  }

  @Auth(AuthType.None)
  @Post('verify-code')
  async verifyCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body() signUpDto: SignupDto,
  ) {
    return this.authService.verifyCode(email, code, signUpDto);
  }

  @Auth(AuthType.None)
  @Post('check-mail')
  async checkMail(@Body('email') email: string) {
    return this.authService.verfiUserByEmailAndSendEmail(email);
  }

  @Auth(AuthType.None)
  @Post('regenerate-code')
  async regenerateCode(@Body('email') email: string) {
    return this.authService.regenerateVerificationCode(email);
  }

  @Auth(AuthType.None)
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Auth(AuthType.None)
  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }
}
