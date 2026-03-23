import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ItemService } from '../item/item.service';
import { SettingsService } from '../settings/settings.service';
import { TagService } from '../tag/tag.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly configService: ConfigService,
    private readonly itemService: ItemService,
    private readonly tagService: TagService,
    private readonly settingsService: SettingsService,
  ) {}

  async getDashboardPageModel(): Promise<Record<string, unknown>> {
    const [items, availableTags, appPrefixes] = await Promise.all([
      this.itemService.findAll({ sortBy: 'totalScore', limit: 100, page: 1 }),
      this.tagService.findAll(),
      this.settingsService.getAppPrefixes(),
    ]);

    return {
      title: this.configService.get<string>(
        'app.name',
        'SuperBookmarks',
      ),
      appName: this.configService.get<string>(
        'app.name',
        'SuperBookmarks',
      ),
      theme: this.configService.get<string>(
        'app.settings.defaultTheme',
        'dark',
      ),
      bootstrap: {
        items,
        availableTags,
        appPrefixes,
        theme: this.configService.get<string>(
          'app.settings.defaultTheme',
          'dark',
        ),
      },
    };
  }
}
