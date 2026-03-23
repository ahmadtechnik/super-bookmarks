import { Body, Controller, Get, Put, Render } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBody,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateAppPrefixesDto } from '../DTOs/settings/update-app-prefixes.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBasicAuth('basic')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Render('pages/settings')
  @ApiProduces('text/html')
  @ApiOperation({ summary: 'Render the settings page.' })
  @ApiResponse({
    status: 200,
    description: 'Settings page rendered successfully.',
  })
  async renderSettingsPage() {
    return this.settingsService.getSettingsPageModel();
  }

  @Get('app-prefixes')
  @ApiOperation({ summary: 'Get all configured application prefixes.' })
  @ApiResponse({
    status: 200,
    description: 'Application prefixes returned successfully.',
  })
  async getAppPrefixes() {
    return {
      appPrefixes: await this.settingsService.getAppPrefixes(),
    };
  }

  @Put('app-prefixes')
  @ApiOperation({ summary: 'Replace the configured application prefixes.' })
  @ApiBody({ type: UpdateAppPrefixesDto })
  @ApiResponse({
    status: 200,
    description: 'Application prefixes updated successfully.',
  })
  async updateAppPrefixes(@Body() updateAppPrefixesDto: UpdateAppPrefixesDto) {
    return this.settingsService.updateAppPrefixes(updateAppPrefixesDto);
  }
}
