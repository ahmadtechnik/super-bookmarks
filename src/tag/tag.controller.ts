import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTagDto } from '../DTOs/tag/create-tag.dto';
import { UpdateTagDto } from '../DTOs/tag/update-tag.dto';
import { TagService } from './tag.service';

@ApiTags('Tag')
@ApiBasicAuth('basic')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tag.' })
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({ status: 201, description: 'Tag created successfully.' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tags.' })
  @ApiResponse({ status: 200, description: 'Tags returned successfully.' })
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':tagId')
  @ApiOperation({ summary: 'Get a single tag.' })
  @ApiParam({ name: 'tagId', description: 'Mongo tag id.' })
  @ApiResponse({ status: 200, description: 'Tag returned successfully.' })
  findOne(@Param('tagId') tagId: string) {
    return this.tagService.findOne(tagId);
  }

  @Patch(':tagId')
  @ApiOperation({ summary: 'Update a tag.' })
  @ApiParam({ name: 'tagId', description: 'Mongo tag id.' })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({ status: 200, description: 'Tag updated successfully.' })
  update(@Param('tagId') tagId: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(tagId, updateTagDto);
  }

  @Delete(':tagId')
  @ApiOperation({ summary: 'Delete a tag.' })
  @ApiParam({ name: 'tagId', description: 'Mongo tag id.' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully.' })
  remove(@Param('tagId') tagId: string) {
    return this.tagService.remove(tagId);
  }
}
