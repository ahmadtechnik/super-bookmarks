import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { TagCategory } from '../../entities/tag-category.enum';

export class CreateTagDto {
  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  content: string;

  @ApiProperty({ enum: TagCategory, enumName: 'TagCategory' })
  @IsEnum(TagCategory)
  category: TagCategory;
}
