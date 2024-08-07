import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SpellerDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly label: string;

  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly query: string;

  @ApiPropertyOptional()
  @Transform((params) => parseInt(params.value))
  @IsIn([1, 2])
  @IsOptional()
  readonly distance: number = 1;

  @ApiPropertyOptional()
  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['eng2kor must be a boolean value']);
  })
  @IsBoolean()
  @IsOptional()
  readonly eng2kor: boolean = true;

  @ApiPropertyOptional()
  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['overflow must be a boolean value']);
  })
  @IsBoolean()
  @IsOptional()
  readonly overflow: boolean = true;
}
