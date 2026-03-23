import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ItemType } from '../../entities/item-type.enum';

export class SearchItemsQueryDto {
  @ApiPropertyOptional({
    description: 'Search target: all, title, description, tag, or type.',
  })
  @IsOptional()
  @IsIn(['all', 'title', 'description', 'tag', 'type'])
  t?: 'all' | 'title' | 'description' | 'tag' | 'type';

  @ApiPropertyOptional({ description: 'Search query string.' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Sort by totalScore, scoreCount, title, or latestScoreDate.',
  })
  @IsOptional()
  @IsIn(['totalScore', 'scoreCount', 'title', 'latestScoreDate'])
  sortBy?: 'totalScore' | 'scoreCount' | 'title' | 'latestScoreDate';

  @ApiPropertyOptional({
    description: 'Optional item type filter.',
    enum: ItemType,
    enumName: 'ItemType',
  })
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType;

  @ApiPropertyOptional({ description: 'Group items by tag, type, or title.' })
  @IsOptional()
  @IsIn(['tag', 'type', 'title'])
  groupBy?: 'tag' | 'type' | 'title';

  @ApiPropertyOptional({ description: 'Specific group value to return.' })
  @IsOptional()
  @IsString()
  groupValue?: string;

  @ApiPropertyOptional({ description: 'Filter only favorite items.' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyFavorites?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
