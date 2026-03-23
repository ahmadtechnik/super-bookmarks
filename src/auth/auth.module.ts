import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AppAuthGuard } from './app-auth.guard';
import { BasicAuthStrategy } from './basic.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    BasicAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: AppAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
