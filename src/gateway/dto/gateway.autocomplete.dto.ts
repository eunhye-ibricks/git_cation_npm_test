import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AutocompleteDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly label: string;

  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @ApiPropertyOptional()
  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['middle must be a boolean value']);
  })
  @IsBoolean()
  @IsOptional()
  readonly middle: boolean = false;

  @ApiPropertyOptional()
  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['reverse must be a boolean value']);
  })
  @IsBoolean()
  readonly reverse: boolean = false;

  @ApiPropertyOptional()
  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Min(0)
  @IsOptional()
  readonly size: number = 10;

  @ApiPropertyOptional()
  @IsIn(['keyword', 'weight'])
  readonly sort: 'keyword' | 'weight' = 'keyword';
}
