import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SimpleSearchDTO {
  @ApiProperty()
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @ApiPropertyOptional()
  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Max(100)
  @Min(0)
  readonly size: number = 10;

  @ApiPropertyOptional()
  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Min(0)
  readonly from: number = 0;

  @ApiPropertyOptional({ description: '시작일 YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료일 YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
