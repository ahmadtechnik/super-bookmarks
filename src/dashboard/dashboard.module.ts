import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ItemModule } from '../item/item.module';
import { SettingsModule } from '../settings/settings.module';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [ItemModule, TagModule, SettingsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
