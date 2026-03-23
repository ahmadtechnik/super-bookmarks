import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAppPrefixesDto } from '../DTOs/settings/update-app-prefixes.dto';
import { Setting, SettingDocument } from '../entities/setting.schema';

@Injectable()
export class SettingsService {
  private readonly appPrefixesKey = 'app_prefixes';

  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
    private readonly configService: ConfigService,
  ) {}

  async getAppPrefixes(): Promise<Array<{ label: string; prefix: string }>> {
    const setting = await this.ensureAppPrefixesSetting();
    const appPrefixes = setting.value.appPrefixes;
    return Array.isArray(appPrefixes)
      ? (appPrefixes as Array<{ label: string; prefix: string }>)
      : [];
  }

  async updateAppPrefixes(updateAppPrefixesDto: UpdateAppPrefixesDto) {
    await this.settingModel.findOneAndUpdate(
      { key: this.appPrefixesKey },
      { value: { appPrefixes: updateAppPrefixesDto.appPrefixes } },
      { new: true, upsert: true },
    );

    return {
      appPrefixes: updateAppPrefixesDto.appPrefixes,
    };
  }

  async getSettingsPageModel() {
    const appName = this.configService.get<string>('app.name', 'SuperBookmarks');

    return {
      title: `${appName} Settings`,
      appName,
      theme: this.configService.get<string>(
        'app.settings.defaultTheme',
        'dark',
      ),
      bootstrap: {
        appPrefixes: await this.getAppPrefixes(),
        theme: this.configService.get<string>(
          'app.settings.defaultTheme',
          'dark',
        ),
      },
    };
  }

  private async ensureAppPrefixesSetting(): Promise<SettingDocument> {
    const existingSetting = await this.settingModel.findOne({
      key: this.appPrefixesKey,
    });
    if (existingSetting) {
      return existingSetting;
    }

    return this.settingModel.create({
      key: this.appPrefixesKey,
      value: {
        appPrefixes: this.configService.get<
          Array<{ label: string; prefix: string }>
        >('app.settings.appPrefixes', []),
      },
    });
  }
}
