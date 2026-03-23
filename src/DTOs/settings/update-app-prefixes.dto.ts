import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class AppPrefixDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  prefix: string;
}

export class UpdateAppPrefixesDto {
  @ApiProperty({ type: [AppPrefixDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppPrefixDto)
  appPrefixes: AppPrefixDto[];
}
