import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { AuthService } from './auth.service';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy) {
  constructor(private readonly authService: AuthService) {
    super({ passReqToCallback: false });
  }

  validate(username: string, password: string): { username: string } {
    const isValid = this.authService.validateCredentials(username, password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return { username };
  }
}
