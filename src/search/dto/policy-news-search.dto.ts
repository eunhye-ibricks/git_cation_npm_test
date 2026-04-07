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

export class PolicyNewsSearchDTO {
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

  @ApiPropertyOptional({ description: '결과내 재검색 키워드' })
  @IsOptional()
  @IsString()
  readonly research_keyword?: string;

  @ApiPropertyOptional({ description: '콘텐츠 상태' })
  @IsOptional()
  @IsString()
  readonly contents_status?: string;

  @ApiPropertyOptional({ description: '콘텐츠 유형' })
  @IsOptional()
  @IsString()
  readonly contents_type?: string;

  @ApiPropertyOptional({ description: '장관 코드' })
  @IsOptional()
  @IsString()
  readonly minister_code?: string;

  @ApiPropertyOptional({ description: '그룹 코드' })
  @IsOptional()
  @IsString()
  readonly grouping_code?: string;

  @ApiPropertyOptional({ description: '승인일 시작 (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  readonly start_date?: string;

  @ApiPropertyOptional({ description: '승인일 종료 (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  readonly end_date?: string;
}
