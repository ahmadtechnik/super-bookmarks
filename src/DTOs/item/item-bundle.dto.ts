import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsBoolean,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ItemType } from '../../entities/item-type.enum';
import { ScoreType } from '../../entities/score-type.enum';
import { TagCategory } from '../../entities/tag-category.enum';

export const ITEM_BUNDLE_FORMAT = 'superbookmarks-items';
export const ITEM_BUNDLE_VERSION = 1;

export class ItemBundleTagDto {
  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  content: string;

  @ApiProperty({ enum: TagCategory, enumName: 'TagCategory' })
  @IsEnum(TagCategory)
  category: TagCategory;
}

export class ItemBundleScoreDto {
  @ApiProperty({ enum: ScoreType, enumName: 'ScoreType' })
  @IsEnum(ScoreType)
  type: ScoreType;

  @ApiProperty({ minimum: 0.1, maximum: 1 })
  @Min(0.1)
  @Max(1)
  score: number;

  @ApiProperty({ description: 'ISO timestamp string.' })
  @IsDateString()
  triggeredDate: string;
}

export class ItemBundleItemDto {
  @ApiPropertyOptional({ description: 'Stable import/export identity key.' })
  @IsOptional()
  @IsString()
  sourceKey?: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ItemType, enumName: 'ItemType' })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFav?: boolean;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metaData?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [ItemBundleTagDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemBundleTagDto)
  tags?: ItemBundleTagDto[];

  @ApiPropertyOptional({ type: [ItemBundleScoreDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemBundleScoreDto)
  scores?: ItemBundleScoreDto[];
}

export class ItemBundleDto {
  @ApiProperty({ default: ITEM_BUNDLE_FORMAT })
  @IsString()
  format: string;

  @ApiProperty({ default: ITEM_BUNDLE_VERSION })
  @IsInt()
  version: number;

  @ApiProperty({ description: 'ISO timestamp string.' })
  @IsDateString()
  exportedAt: string;

  @ApiPropertyOptional({ type: [ItemBundleTagDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemBundleTagDto)
  tags?: ItemBundleTagDto[];

  @ApiProperty({ type: [ItemBundleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemBundleItemDto)
  items: ItemBundleItemDto[];
}