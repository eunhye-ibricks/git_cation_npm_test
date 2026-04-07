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

export class ThesisSearchDTO {
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

  @ApiPropertyOptional({ description: '저자 ' })
  @IsOptional()
  @IsString()
  readonly author?: string;

  @ApiPropertyOptional({ description: '발행 시작년도' })
  @IsOptional()
  @IsString()
  readonly stdate?: string;

  @ApiPropertyOptional({ description: '발행 종료년도' })
  @IsOptional()
  @IsString()
  readonly enddate?: string;

  @ApiPropertyOptional({ description: '주관부처명' })
  @IsOptional()
  @IsString()
  readonly ministry_name?: string;

  @ApiPropertyOptional({ description: '수행기관명' })
  @IsOptional()
  @IsString()
  readonly location_org?: string;
}
