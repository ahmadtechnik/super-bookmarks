import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ItemModule } from './item/item.module';
import { SearchModule } from './search/search.module';
import { SettingsModule } from './settings/settings.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
    AuthModule,
    DashboardModule,
    SettingsModule,
    ItemModule,
    TagModule,
    SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
