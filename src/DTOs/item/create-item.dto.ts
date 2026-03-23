import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ItemType } from '../../entities/item-type.enum';

export class CreateItemDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Mongo ObjectId values for related tags.',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];

  @ApiProperty({ enum: ItemType, enumName: 'ItemType' })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFav?: boolean;

  @ApiPropertyOptional({
    type: Object,
    description: 'Flexible metadata based on item type.',
  })
  @IsOptional()
  @IsObject()
  metaData?: Record<string, unknown>;
}
