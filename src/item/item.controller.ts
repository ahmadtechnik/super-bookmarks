import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddScoreDto } from '../DTOs/item/add-score.dto';
import { CreateItemDto } from '../DTOs/item/create-item.dto';
import { ItemBundleDto } from '../DTOs/item/item-bundle.dto';
import { UpdateItemDto } from '../DTOs/item/update-item.dto';
import { SearchItemsQueryDto } from '../DTOs/search/search-items-query.dto';
import { ItemService } from './item.service';

@ApiTags('Item')
@ApiBasicAuth('basic')
@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @ApiOperation({ summary: 'Create a dashboard item.' })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({ status: 201, description: 'Item created successfully.' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'List dashboard items with sorting and filtering.' })
  @ApiResponse({ status: 200, description: 'Items returned successfully.' })
  findAll(@Query() query: SearchItemsQueryDto) {
    return this.itemService.findAll(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export dashboard items, scores, and related tags.' })
  @ApiResponse({ status: 200, description: 'Export bundle returned successfully.' })
  exportBundle() {
    return this.itemService.exportBundle();
  }

  @Post('import')
  @ApiOperation({ summary: 'Import dashboard items, scores, and related tags from a bundle.' })
  @ApiBody({ type: ItemBundleDto })
  @ApiResponse({ status: 201, description: 'Import completed successfully.' })
  importBundle(@Body() bundle: ItemBundleDto) {
    return this.itemService.importBundle(bundle);
  }

  @Get(':itemId')
  @ApiOperation({ summary: 'Get one dashboard item.' })
  @ApiParam({ name: 'itemId', description: 'Mongo item id.' })
  @ApiResponse({ status: 200, description: 'Item returned successfully.' })
  findOne(@Param('itemId') itemId: string) {
    return this.itemService.findOne(itemId);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update a dashboard item.' })
  @ApiParam({ name: 'itemId', description: 'Mongo item id.' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({ status: 200, description: 'Item updated successfully.' })
  update(
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemService.update(itemId, updateItemDto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Delete a dashboard item.' })
  @ApiParam({ name: 'itemId', description: 'Mongo item id.' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully.' })
  remove(@Param('itemId') itemId: string) {
    return this.itemService.remove(itemId);
  }

  @Get(':itemId/scores')
  @ApiOperation({ summary: 'Get score entries for a dashboard item.' })
  @ApiParam({ name: 'itemId', description: 'Mongo item id.' })
  @ApiResponse({
    status: 200,
    description: 'Item scores returned successfully.',
  })
  getScores(@Param('itemId') itemId: string) {
    return this.itemService.getScores(itemId);
  }

  @Post(':itemId/score')
  @ApiOperation({ summary: 'Append a score entry to a dashboard item.' })
  @ApiParam({ name: 'itemId', description: 'Mongo item id.' })
  @ApiBody({ type: AddScoreDto })
  @ApiResponse({ status: 201, description: 'Item score added successfully.' })
  addScore(@Param('itemId') itemId: string, @Body() addScoreDto: AddScoreDto) {
    return this.itemService.addScore(itemId, addScoreDto);
  }
}
