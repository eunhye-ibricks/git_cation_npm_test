import { BadRequestException } from '@nestjs/common';
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

  @Transform((params) => parseInt(params.value))
  @IsIn([1, 2])
  readonly distance?: number = 1;

  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['middle must be a boolean value']);
  })
  @IsBoolean()
  @IsOptional()
  readonly eng2kor?: boolean = true;

  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['middle must be a boolean value']);
  })
  @IsBoolean()
  @IsOptional()
  readonly overflow?: boolean = true;
}
