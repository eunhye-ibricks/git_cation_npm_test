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

export class AutocompleteDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly label: string;

  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['middle must be a boolean value']);
  })
  @IsBoolean()
  @IsOptional()
  readonly middle?: boolean = false;

  @Transform((params) => {
    if (params.value === 'true') return true;
    if (params.value === 'false' || params.value === '') return false;
    throw new BadRequestException(['reverse must be a boolean value']);
  })
  @IsBoolean()
  readonly reverse?: boolean = false;

  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Min(0)
  readonly size?: number = 10;

  @IsIn(['keyword', 'weight'])
  readonly sort?: string = 'keyword';
}
