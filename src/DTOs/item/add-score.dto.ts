import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ScoreType } from '../../entities/score-type.enum';

export class AddScoreDto {
  @ApiProperty({ enum: ScoreType, enumName: 'ScoreType' })
  @IsEnum(ScoreType)
  type: ScoreType;

  @ApiPropertyOptional({ default: 0.1, minimum: 0.1, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1)
  score?: number;

  @ApiPropertyOptional({
    description: 'Optional ISO date override for imported scores.',
  })
  @IsOptional()
  @IsDateString()
  triggeredDate?: string;
}
