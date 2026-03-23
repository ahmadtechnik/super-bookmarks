import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchItemsQueryDto } from '../DTOs/search/search-items-query.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBasicAuth('basic')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search and group dashboard items.' })
  @ApiResponse({
    status: 200,
    description: 'Search results returned successfully.',
  })
  search(
    @Query() query: SearchItemsQueryDto,
  ): Promise<Record<string, unknown>> {
    return this.searchService.search(query);
  }
}
