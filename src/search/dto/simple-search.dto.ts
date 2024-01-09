import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SimpleSearchDTO {
  @Transform((params) => params.value.trim())
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @IsOptional()
  @Transform((params) => parseInt(params.value))
  @IsInt()
  @IsPositive()
  @Min(0)
  @Max(10000)
  readonly size: number;

  @IsOptional()
  @Transform((params) => parseInt(params.value))
  @IsInt()
  @Min(0)
  readonly from: number;
}
