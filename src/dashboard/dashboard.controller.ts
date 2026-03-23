import { Controller, Get, Render } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBasicAuth('basic')
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Render('pages/home')
  @ApiProduces('text/html')
  @ApiOperation({ summary: 'Render the main dashboard page.' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard page rendered successfully.',
  })
  async renderHome(): Promise<Record<string, unknown>> {
    return this.dashboardService.getDashboardPageModel();
  }
}
